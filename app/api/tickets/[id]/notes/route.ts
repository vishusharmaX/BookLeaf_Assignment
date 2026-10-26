import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addTicketNote } from "@/services/tickets/ticketService";
import { CreateNoteSchema } from "@/lib/validation/schemas";

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
        { error: "Forbidden: Only operations staff can post internal notes." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = CreateNoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const note = await addTicketNote(params.id, session, validation.data.body);
    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating internal note";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
