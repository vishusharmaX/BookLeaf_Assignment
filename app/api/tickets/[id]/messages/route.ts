import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addTicketMessage } from "@/services/tickets/ticketService";
import { CreateMessageSchema } from "@/lib/validation/schemas";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = CreateMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const message = await addTicketMessage(params.id, session, validation.data.body);
    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error posting reply";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
