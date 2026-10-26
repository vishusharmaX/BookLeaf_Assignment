import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { generateDraftReply } from "@/lib/ai/service";
import { TicketCategory, TicketPriority } from "@/lib/ai/knowledgeBase";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can generate AI draft replies." },
        { status: 403 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        author: { include: { user: true } },
        book: true,
        messages: {
          orderBy: { createdAt: "asc" },
          take: 6,
          include: { sender: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const draft = await generateDraftReply(
      {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        description: ticket.description,
        bookTitle: ticket.book?.title,
        bookStatus: ticket.book?.status,
        bookIsbn: ticket.book?.isbn,
        authorName: ticket.author.user.name,
        previousMessages: ticket.messages.map((m) => ({
          senderRole: m.sender.role as "AUTHOR" | "ADMIN",
          senderName: m.sender.name,
          body: m.body,
          createdAt: m.createdAt,
        })),
      },
      ticket.category as TicketCategory,
      ticket.priority as TicketPriority
    );

    return NextResponse.json({ success: true, draft });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error generating AI draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
