import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { classifyTicket } from "@/lib/ai/service";
import { emitTicketEvent } from "@/lib/realtime/events";

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
        { error: "Forbidden: Only administrators can trigger AI re-classification." },
        { status: 403 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        author: { include: { user: true } },
        book: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const aiResult = await classifyTicket({
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      description: ticket.description,
      bookTitle: ticket.book?.title,
      bookStatus: ticket.book?.status,
      bookIsbn: ticket.book?.isbn,
      authorName: ticket.author.user.name,
    });

    const updated = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        category: aiResult.category,
        priority: aiResult.priority,
        classificationReason: aiResult.reasoning,
        suggestedNextStep: aiResult.suggestedNextStep,
      },
    });

    await prisma.ticketAuditLog.create({
      data: {
        ticketId: ticket.id,
        actorId: session.userId,
        action: "AI_RECLASSIFIED",
        newValue: `${aiResult.category} (${aiResult.priority})`,
      },
    });

    emitTicketEvent({
      type: "CATEGORY_CHANGE",
      ticketId: ticket.id,
      data: {
        category: updated.category,
        priority: updated.priority,
        reasoning: updated.classificationReason,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, classification: aiResult, ticket: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error running classification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
