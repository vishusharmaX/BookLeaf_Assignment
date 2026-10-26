import { describe, it, expect } from "vitest";
import prisma from "@/lib/db/prisma";
import { classifyTicket, generateDraftReply } from "@/lib/ai/service";
import { CATEGORIES, PRIORITIES } from "@/lib/ai/knowledgeBase";
import { getAuthorDashboardStats } from "@/services/books/bookService";
import { createTicket, addTicketMessage, addTicketNote } from "@/services/tickets/ticketService";
import * as bcrypt from "bcryptjs";

describe("BookLeaf System Validation & Business Logic Tests", () => {
  it("should have imported exactly 10 authors and 18 books from sample dataset", async () => {
    const authorCount = await prisma.authorProfile.count();
    const bookCount = await prisma.book.count();

    expect(authorCount).toBe(10);
    expect(bookCount).toBe(18);
  });

  it("should correctly handle sample dataset edge cases (null dates, null MRP, pending royalties)", async () => {
    // Book in production with null publicationDate and null MRP
    const bookInProd = await prisma.book.findUnique({
      where: { externalBookId: "BK013" }, // Midnight in Mysore
    });

    expect(bookInProd).toBeDefined();
    expect(bookInProd?.status).toBe("In Production - Cover Design");
    expect(bookInProd?.publicationDate).toBeNull();
    expect(bookInProd?.mrp).toBeNull();
    expect(bookInProd?.totalCopiesSold).toBe(0);

    // Book with zero payout date and pending royalties
    const bookWithPending = await prisma.book.findUnique({
      where: { externalBookId: "BK005" }, // Between Two Temples
    });

    expect(bookWithPending).toBeDefined();
    expect(bookWithPending?.lastRoyaltyPayoutDate).toBeNull();
    expect(bookWithPending?.royaltyPaid).toBe(0);
    expect(bookWithPending?.royaltyPending).toBe(2546);
  });

  it("should calculate author dashboard totals accurately from actual database records", async () => {
    // Priya Sharma AUTH001 has BK001 (earned 11970, paid 8400, pending 3570) and BK002 (earned 7938, paid 7938, pending 0)
    const priya = await prisma.authorProfile.findFirst({
      where: { externalAuthorId: "AUTH001" },
    });

    expect(priya).toBeDefined();
    const stats = await getAuthorDashboardStats(priya!.id);

    expect(stats.metrics.totalBooks).toBe(2);
    expect(stats.metrics.publishedBooks).toBe(2);
    expect(stats.metrics.inProductionBooks).toBe(0);
    expect(stats.metrics.totalCopiesSold).toBe(342 + 189); // 531
    expect(stats.metrics.totalRoyaltyEarned).toBe(11970 + 7938); // 19908
    expect(stats.metrics.totalRoyaltyPaid).toBe(8400 + 7938); // 16338
    expect(stats.metrics.totalRoyaltyPending).toBe(3570 + 0); // 3570
  });

  it("AI Engine: should classify royalty query into 'Royalty & Payments' with appropriate priority", async () => {
    const result = await classifyTicket({
      subject: "I published my book 4 months ago and still haven't received any royalty. What's going on?",
      description: "My book was published in June and my dashboard shows pending balance of ₹3,500. When will I get paid?",
    });

    expect(CATEGORIES).toContain(result.category);
    expect(result.category).toBe("Royalty & Payments");
    expect(PRIORITIES).toContain(result.priority);
    expect(result.reasoning.length).toBeGreaterThan(5);
  });

  it("AI Engine: should classify ISBN dispute into 'ISBN & Metadata Issues' with High priority", async () => {
    const result = await classifyTicket({
      subject: "My book is showing a different ISBN on Amazon than what's on the physical copy.",
      description: "Please check this duplicate ISBN mismatch urgently.",
    });

    expect(result.category).toBe("ISBN & Metadata Issues");
    expect(result.priority).toBe("High");
  });

  it("AI Engine: should draft response incorporating BookLeaf Knowledge Base policies without corporate deflection", async () => {
    const draft = await generateDraftReply(
      {
        subject: "Royalty payout inquiry",
        description: "Why hasn't my royalty been paid yet?",
        authorName: "Priya Sharma",
      },
      "Royalty & Payments",
      "High"
    );

    expect(draft.draftReply).toContain("80/20");
    expect(draft.draftReply).toContain("quarterly");
    expect(draft.draftReply).toContain("1,000");
    expect(draft.draftReply).toContain("Priya Sharma");
  });

  it("Security: Book ownership verification on ticket submission", async () => {
    // Sneha Kulkarni AUTH007 trying to submit a ticket for BK001 which belongs to Priya Sharma AUTH001
    const sneha = await prisma.authorProfile.findFirst({
      where: { externalAuthorId: "AUTH007" },
      include: { user: true },
    });
    const priyaBook = await prisma.book.findFirst({
      where: { externalBookId: "BK001" },
    });

    expect(sneha).toBeDefined();
    expect(priyaBook).toBeDefined();

    await expect(
      createTicket(sneha!.id, sneha!.userId, sneha!.user.name, {
        bookId: priyaBook!.id,
        subject: "Attempting to query someone else's book",
        description: "This should be forbidden by server-side validation checks.",
      })
    ).rejects.toThrow("Forbidden");
  });

  it("Security: Non-admin users cannot create internal notes", async () => {
    const priya = await prisma.authorProfile.findFirst({
      where: { externalAuthorId: "AUTH001" },
      include: { user: true },
    });
    const ticket = await prisma.ticket.findFirst();

    expect(priya).toBeDefined();
    expect(ticket).toBeDefined();

    await expect(
      addTicketNote(
        ticket!.id,
        {
          userId: priya!.userId,
          email: priya!.user.email,
          name: priya!.user.name,
          role: "AUTHOR",
        },
        "Sneaky author trying to inject internal note"
      )
    ).rejects.toThrow("Forbidden");
  });
});
