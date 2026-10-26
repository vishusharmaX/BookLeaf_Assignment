import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAuthorBooks } from "@/services/books/bookService";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "AUTHOR" || !session.authorId) {
      return NextResponse.json({ error: "Forbidden: Author account required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const sortBy = (searchParams.get("sortBy") as "title" | "sold" | "royalty" | "date") || undefined;
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || undefined;

    const books = await getAuthorBooks(session.authorId, {
      search,
      status,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({ books });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching books";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
