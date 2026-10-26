import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAuthorTickets, getAdminTickets, createTicket } from "@/services/tickets/ticketService";
import { CreateTicketSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    if (session.role === "AUTHOR") {
      if (!session.authorId) {
        return NextResponse.json({ error: "Author profile not found" }, { status: 403 });
      }
      const status = searchParams.get("status") || undefined;
      const tickets = await getAuthorTickets(session.authorId, status);
      return NextResponse.json({ tickets });
    }

    if (session.role === "ADMIN") {
      const status = searchParams.get("status") || undefined;
      const category = searchParams.get("category") || undefined;
      const priority = searchParams.get("priority") || undefined;
      const search = searchParams.get("search") || undefined;
      const page = parseInt(searchParams.get("page") || "1", 10);
      const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

      const result = await getAdminTickets({
        status,
        category,
        priority,
        search,
        page,
        pageSize,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching tickets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "AUTHOR" || !session.authorId) {
      return NextResponse.json(
        { error: "Forbidden: Only authors can submit support tickets." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = CreateTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const ticket = await createTicket(
      session.authorId,
      session.userId,
      session.name,
      validation.data
    );

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating ticket";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
