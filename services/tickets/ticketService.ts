import prisma from "@/lib/db/prisma";
import { CreateTicketInput, UpdateTicketInput } from "@/lib/validation/schemas";
import { classifyTicket } from "@/lib/ai/service";
import { emitTicketEvent } from "@/lib/realtime/events";
import { SessionPayload } from "@/lib/auth/jwt";

export interface TicketFilterOptions {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getAuthorTickets(authorId: string, status?: string) {
  const whereClause: {
    authorId: string;
    status?: string;
  } = { authorId };

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  return prisma.ticket.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          isbn: true,
          status: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: { name: true, role: true },
          },
        },
      },
    },
  });
}

export async function getAdminTickets(options: TicketFilterOptions = {}) {
  const {
    status,
    category,
    priority,
    search,
    page = 1,
    pageSize = 20,
  } = options;

  const whereClause: {
    status?: string;
    category?: string;
    priority?: string;
    OR?: Array<{
      ticketNumber?: { contains: string };
      subject?: { contains: string };
      description?: { contains: string };
      author?: {
        user?: {
          name?: { contains: string };
          email?: { contains: string };
        };
      };
    }>;
  } = {};

  if (status && status !== "ALL") {
    whereClause.status = status;
  }
  if (category && category !== "ALL") {
    whereClause.category = category;
  }
  if (priority && priority !== "ALL") {
    whereClause.priority = priority;
  }

  if (search && search.trim() !== "") {
    const query = search.trim();
    whereClause.OR = [
      { ticketNumber: { contains: query } },
      { subject: { contains: query } },
      { description: { contains: query } },
      { author: { user: { name: { contains: query } } } },
      { author: { user: { email: { contains: query } } } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [totalCount, tickets] = await Promise.all([
    prisma.ticket.count({ where: whereClause }),
    prisma.ticket.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: [
        // Priority ordering: Critical first, then High, then creation date asc for older unresolved
        { createdAt: "desc" },
      ],
      include: {
        author: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        book: {
          select: { id: true, title: true, isbn: true, status: true },
        },
        assignedAdmin: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            body: true,
            createdAt: true,
            sender: { select: { name: true, role: true } },
          },
        },
        _count: {
          select: { notes: true, messages: true },
        },
      },
    }),
  ]);

  return {
    tickets,
    pagination: {
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getTicketDetails(ticketId: string, session: SessionPayload) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      author: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      book: true,
      assignedAdmin: {
        select: { id: true, name: true, email: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, name: true, role: true },
          },
        },
      },
      // Admin only relations
      ...(session.role === "ADMIN"
        ? {
            notes: {
              orderBy: { createdAt: "desc" },
              include: {
                admin: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            auditLogs: {
              orderBy: { createdAt: "desc" },
              include: {
                actor: {
                  select: { id: true, name: true },
                },
              },
            },
          }
        : {}),
    },
  });

  if (!ticket) return null;

  // Strict ownership check for Authors
  if (session.role === "AUTHOR" && ticket.authorId !== session.authorId) {
    throw new Error("Forbidden: You are not authorized to access this ticket.");
  }

  return ticket;
}

export async function createTicket(
  authorId: string,
  userId: string,
  authorName: string,
  input: CreateTicketInput
) {
  // 1. Verify book ownership if bookId provided
  let bookTitle: string | null = null;
  let bookStatus: string | null = null;
  let bookIsbn: string | null = null;

  if (input.bookId) {
    const book = await prisma.book.findUnique({
      where: { id: input.bookId },
    });

    if (!book) {
      throw new Error("Invalid book selection.");
    }

    if (book.authorId !== authorId) {
      throw new Error("Forbidden: Selected book does not belong to you.");
    }

    bookTitle = book.title;
    bookStatus = book.status;
    bookIsbn = book.isbn;
  }

  // 2. Generate sequential/unique human-friendly ticket number
  const count = await prisma.ticket.count();
  const ticketNumber = `BL-${1000 + count + 1}`;

  // 3. Persist ticket immediately (Status: Open)
  const initialTicket = await prisma.ticket.create({
    data: {
      ticketNumber,
      authorId,
      bookId: input.bookId || null,
      subject: input.subject,
      description: input.description,
      attachmentUrl: input.attachmentUrl || null,
      category: "General Inquiry",
      priority: "Medium",
      status: "Open",
    },
  });

  // 4. Create initial conversation message
  await prisma.ticketMessage.create({
    data: {
      ticketId: initialTicket.id,
      senderId: userId,
      body: input.description,
      visibility: "PUBLIC",
    },
  });

  // 5. Attempt AI Classification asynchronously (graceful fallback built-in)
  try {
    const aiResult = await classifyTicket({
      ticketNumber,
      subject: input.subject,
      description: input.description,
      bookTitle,
      bookStatus,
      bookIsbn,
      authorName,
    });

    const updatedTicket = await prisma.ticket.update({
      where: { id: initialTicket.id },
      data: {
        category: aiResult.category,
        priority: aiResult.priority,
        classificationReason: aiResult.reasoning,
        suggestedNextStep: aiResult.suggestedNextStep,
      },
      include: {
        book: true,
      },
    });

    emitTicketEvent({
      type: "STATUS_CHANGE",
      ticketId: updatedTicket.id,
      data: {
        status: updatedTicket.status,
        category: updatedTicket.category,
        priority: updatedTicket.priority,
      },
      timestamp: new Date().toISOString(),
    });

    return updatedTicket;
  } catch (err) {
    console.error("Non-blocking AI classification error:", err);
    return initialTicket;
  }
}

export async function addTicketMessage(
  ticketId: string,
  session: SessionPayload,
  body: string
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) throw new Error("Ticket not found.");

  if (session.role === "AUTHOR" && ticket.authorId !== session.authorId) {
    throw new Error("Forbidden: You cannot reply to another author's ticket.");
  }

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId: session.userId,
      body,
      visibility: "PUBLIC",
    },
    include: {
      sender: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  // If admin is replying and ticket was "Open", automatically advance status to "In Progress"
  let newStatus = ticket.status;
  if (session.role === "ADMIN" && ticket.status === "Open") {
    newStatus = "In Progress";
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "In Progress" },
    });

    await prisma.ticketAuditLog.create({
      data: {
        ticketId,
        actorId: session.userId,
        action: "STATUS_CHANGE",
        previousValue: "Open",
        newValue: "In Progress",
      },
    });
  }

  // Real-time broadcast
  emitTicketEvent({
    type: "NEW_MESSAGE",
    ticketId,
    data: {
      message,
      ticketStatus: newStatus,
    },
    timestamp: new Date().toISOString(),
  });

  return message;
}

export async function addTicketNote(
  ticketId: string,
  adminSession: SessionPayload,
  body: string
) {
  if (adminSession.role !== "ADMIN") {
    throw new Error("Forbidden: Only administrators can create internal notes.");
  }

  const note = await prisma.ticketNote.create({
    data: {
      ticketId,
      adminId: adminSession.userId,
      body,
    },
    include: {
      admin: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  await prisma.ticketAuditLog.create({
    data: {
      ticketId,
      actorId: adminSession.userId,
      action: "NOTE_ADDED",
      newValue: body.slice(0, 100),
    },
  });

  // Strictly NOT broadcast to author channels
  return note;
}

export async function updateTicket(
  ticketId: string,
  adminSession: SessionPayload,
  updates: UpdateTicketInput
) {
  if (adminSession.role !== "ADMIN") {
    throw new Error("Forbidden: Administrator access required.");
  }

  const current = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!current) throw new Error("Ticket not found.");

  const updateData: {
    status?: string;
    category?: string;
    priority?: string;
    assignedAdminId?: string | null;
    resolvedAt?: Date | null;
  } = {};

  if (updates.status && updates.status !== current.status) {
    updateData.status = updates.status;
    if (updates.status === "Resolved" || updates.status === "Closed") {
      updateData.resolvedAt = new Date();
    } else {
      updateData.resolvedAt = null;
    }

    await prisma.ticketAuditLog.create({
      data: {
        ticketId,
        actorId: adminSession.userId,
        action: "STATUS_CHANGE",
        previousValue: current.status,
        newValue: updates.status,
      },
    });
  }

  if (updates.category && updates.category !== current.category) {
    updateData.category = updates.category;
    await prisma.ticketAuditLog.create({
      data: {
        ticketId,
        actorId: adminSession.userId,
        action: "CATEGORY_OVERRIDE",
        previousValue: current.category,
        newValue: updates.category,
      },
    });
  }

  if (updates.priority && updates.priority !== current.priority) {
    updateData.priority = updates.priority;
    await prisma.ticketAuditLog.create({
      data: {
        ticketId,
        actorId: adminSession.userId,
        action: "PRIORITY_OVERRIDE",
        previousValue: current.priority,
        newValue: updates.priority,
      },
    });
  }

  if (updates.assignedAdminId !== undefined && updates.assignedAdminId !== current.assignedAdminId) {
    updateData.assignedAdminId = updates.assignedAdminId;
    await prisma.ticketAuditLog.create({
      data: {
        ticketId,
        actorId: adminSession.userId,
        action: "ASSIGNMENT",
        previousValue: current.assignedAdminId || "Unassigned",
        newValue: updates.assignedAdminId || "Unassigned",
      },
    });
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: updateData,
    include: {
      assignedAdmin: { select: { id: true, name: true } },
    },
  });

  emitTicketEvent({
    type: "STATUS_CHANGE",
    ticketId,
    data: {
      status: updatedTicket.status,
      category: updatedTicket.category,
      priority: updatedTicket.priority,
      assignedAdmin: updatedTicket.assignedAdmin,
    },
    timestamp: new Date().toISOString(),
  });

  return updatedTicket;
}
