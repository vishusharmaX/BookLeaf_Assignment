import prisma from "@/lib/db/prisma";

export interface BookFilterOptions {
  search?: string;
  status?: string;
  sortBy?: "title" | "sold" | "royalty" | "date";
  sortOrder?: "asc" | "desc";
}

export async function getAuthorBooks(authorId: string, options: BookFilterOptions = {}) {
  const { search, status, sortBy = "date", sortOrder = "desc" } = options;

  const whereClause: {
    authorId: string;
    status?: string;
    OR?: Array<{ title?: { contains: string }; isbn?: { contains: string } }>;
  } = {
    authorId,
  };

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  if (search && search.trim() !== "") {
    const term = search.trim();
    whereClause.OR = [
      { title: { contains: term } },
      { isbn: { contains: term } },
    ];
  }

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sortBy === "title") orderBy = { title: sortOrder };
  if (sortBy === "sold") orderBy = { totalCopiesSold: sortOrder };
  if (sortBy === "royalty") orderBy = { totalRoyaltyEarned: sortOrder };
  if (sortBy === "date") orderBy = { publicationDate: sortOrder };

  const books = await prisma.book.findMany({
    where: whereClause,
    orderBy,
    include: {
      tickets: {
        select: {
          id: true,
          ticketNumber: true,
          status: true,
        },
      },
    },
  });

  return books.map((book) => ({
    ...book,
    availableOnList: (() => {
      try {
        return JSON.parse(book.availableOn);
      } catch {
        return [];
      }
    })(),
  }));
}

export async function getBookDetails(bookId: string, authorId?: string) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      author: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      tickets: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          category: true,
          priority: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!book) return null;

  // Authorization check: if authorId provided, must match
  if (authorId && book.authorId !== authorId) {
    throw new Error("Forbidden: You do not have permission to view this book.");
  }

  return {
    ...book,
    availableOnList: (() => {
      try {
        return JSON.parse(book.availableOn);
      } catch {
        return [];
      }
    })(),
  };
}

export async function getAuthorDashboardStats(authorId: string) {
  const books = await prisma.book.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
  });

  const totalBooks = books.length;
  const publishedBooks = books.filter((b) => b.status === "Published & Live").length;
  const inProductionBooks = totalBooks - publishedBooks;

  const totalCopiesSold = books.reduce((acc, b) => acc + (b.totalCopiesSold || 0), 0);
  const totalRoyaltyEarned = books.reduce((acc, b) => acc + (b.totalRoyaltyEarned || 0), 0);
  const totalRoyaltyPaid = books.reduce((acc, b) => acc + (b.royaltyPaid || 0), 0);
  const totalRoyaltyPending = books.reduce((acc, b) => acc + (b.royaltyPending || 0), 0);

  const openTickets = await prisma.ticket.count({
    where: {
      authorId,
      status: { in: ["Open", "In Progress"] },
    },
  });

  const recentBooks = books.slice(0, 3).map((b) => ({
    ...b,
    availableOnList: (() => {
      try {
        return JSON.parse(b.availableOn);
      } catch {
        return [];
      }
    })(),
  }));

  const recentTickets = await prisma.ticket.findMany({
    where: { authorId },
    orderBy: { updatedAt: "desc" },
    take: 3,
    include: {
      book: {
        select: { title: true },
      },
    },
  });

  return {
    metrics: {
      totalBooks,
      publishedBooks,
      inProductionBooks,
      totalCopiesSold,
      totalRoyaltyEarned,
      totalRoyaltyPaid,
      totalRoyaltyPending,
      openTickets,
    },
    recentBooks,
    recentTickets,
  };
}
