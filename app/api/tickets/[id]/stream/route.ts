import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { subscribeTicketEvent, TicketRealtimeEvent } from "@/lib/realtime/events";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ticketId = params.id;
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, authorId: true },
  });

  if (!ticket) {
    return new Response("Ticket not found", { status: 404 });
  }

  // Authorization: Authors can only stream their own tickets
  if (session.role === "AUTHOR" && ticket.authorId !== session.authorId) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial connection payload
      const initMessage = `data: ${JSON.stringify({
        type: "CONNECTED",
        ticketId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      // 2. Subscribe to real-time events for this ticket
      const unsubscribe = subscribeTicketEvent(ticketId, (event: TicketRealtimeEvent) => {
        try {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Stream might be closed
        }
      });

      // 3. Keep-alive heartbeat every 20 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 20000);

      // 4. Cleanup when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
