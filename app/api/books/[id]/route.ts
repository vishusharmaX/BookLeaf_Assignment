import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getBookDetails } from "@/services/books/bookService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookId = params.id;
    // If author, must pass authorId to enforce authorization
    const authorId = session.role === "AUTHOR" ? session.authorId : undefined;

    const book = await getBookDetails(bookId, authorId);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching book";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
