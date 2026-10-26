import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface SampleBook {
  book_id: string;
  title: string;
  isbn: string;
  genre: string;
  publication_date: string | null;
  status: string;
  mrp: number | null;
  author_royalty_per_copy: number | null;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
  last_royalty_payout_date: string | null;
  print_partner: string | null;
  available_on: string[];
}

interface SampleAuthor {
  author_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joined_date: string;
  books: SampleBook[];
}

interface SampleData {
  authors: SampleAuthor[];
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Load sample dataset
  const sampleFilePath = path.join(process.cwd(), "bookleaf_sample_data.json");
  if (!fs.existsSync(sampleFilePath)) {
    throw new Error(`Sample data file not found at ${sampleFilePath}`);
  }

  const rawData = fs.readFileSync(sampleFilePath, "utf-8");
  const data: SampleData = JSON.parse(rawData);

  // Common password hashes
  const authorPasswordHash = await bcrypt.hash("AuthorPassword123!", 10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);

  // 1. Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bookleafpublishing.in" },
    update: {
      name: "BookLeaf Operations",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: "BookLeaf Operations",
      email: "admin@bookleafpublishing.in",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user seeded: ${adminUser.email}`);

  // Also seed a secondary admin for testing assignments
  const admin2 = await prisma.user.upsert({
    where: { email: "vikas.ops@bookleafpublishing.in" },
    update: {
      name: "Vikas Sharma (Ops Lead)",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: "Vikas Sharma (Ops Lead)",
      email: "vikas.ops@bookleafpublishing.in",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`✅ Secondary admin user seeded: ${admin2.email}`);

  // 2. Seed Authors and Books
  let authorCount = 0;
  let bookCount = 0;

  for (const authorData of data.authors) {
    // Upsert User record
    const user = await prisma.user.upsert({
      where: { email: authorData.email.toLowerCase().trim() },
      update: {
        name: authorData.name,
        role: "AUTHOR",
      },
      create: {
        name: authorData.name,
        email: authorData.email.toLowerCase().trim(),
        passwordHash: authorPasswordHash,
        role: "AUTHOR",
      },
    });

    // Upsert AuthorProfile record
    const authorProfile = await prisma.authorProfile.upsert({
      where: { userId: user.id },
      update: {
        externalAuthorId: authorData.author_id,
        phone: authorData.phone,
        city: authorData.city,
        joinedDate: new Date(authorData.joined_date),
      },
      create: {
        userId: user.id,
        externalAuthorId: authorData.author_id,
        phone: authorData.phone,
        city: authorData.city,
        joinedDate: new Date(authorData.joined_date),
      },
    });

    authorCount++;

    // Upsert Books for this author
    for (const book of authorData.books) {
      await prisma.book.upsert({
        where: { externalBookId: book.book_id },
        update: {
          title: book.title,
          isbn: book.isbn,
          genre: book.genre,
          publicationDate: book.publication_date ? new Date(book.publication_date) : null,
          status: book.status,
          mrp: book.mrp !== null ? Number(book.mrp) : null,
          authorRoyaltyPerCopy: book.author_royalty_per_copy !== null ? Number(book.author_royalty_per_copy) : null,
          totalCopiesSold: book.total_copies_sold,
          totalRoyaltyEarned: Number(book.total_royalty_earned),
          royaltyPaid: Number(book.royalty_paid),
          royaltyPending: Number(book.royalty_pending),
          lastRoyaltyPayoutDate: book.last_royalty_payout_date ? new Date(book.last_royalty_payout_date) : null,
          printPartner: book.print_partner,
          availableOn: JSON.stringify(book.available_on || []),
          authorId: authorProfile.id,
        },
        create: {
          externalBookId: book.book_id,
          title: book.title,
          isbn: book.isbn,
          genre: book.genre,
          publicationDate: book.publication_date ? new Date(book.publication_date) : null,
          status: book.status,
          mrp: book.mrp !== null ? Number(book.mrp) : null,
          authorRoyaltyPerCopy: book.author_royalty_per_copy !== null ? Number(book.author_royalty_per_copy) : null,
          totalCopiesSold: book.total_copies_sold,
          totalRoyaltyEarned: Number(book.total_royalty_earned),
          royaltyPaid: Number(book.royalty_paid),
          royaltyPending: Number(book.royalty_pending),
          lastRoyaltyPayoutDate: book.last_royalty_payout_date ? new Date(book.last_royalty_payout_date) : null,
          printPartner: book.print_partner,
          availableOn: JSON.stringify(book.available_on || []),
          authorId: authorProfile.id,
        },
      });
      bookCount++;
    }
  }

  console.log(`✅ Seeded ${authorCount} authors and ${bookCount} books.`);

  // 3. Seed Realistic Initial Support Tickets for testing & evaluation
  const priyaAuthor = await prisma.authorProfile.findFirst({
    where: { externalAuthorId: "AUTH001" },
    include: { user: true, books: true },
  });

  const snehaAuthor = await prisma.authorProfile.findFirst({
    where: { externalAuthorId: "AUTH007" },
    include: { user: true, books: true },
  });

  const ananyaAuthor = await prisma.authorProfile.findFirst({
    where: { externalAuthorId: "AUTH003" },
    include: { user: true, books: true },
  });

  if (priyaAuthor && priyaAuthor.books.length > 0) {
    const book1 = priyaAuthor.books[0];
    const ticket1 = await prisma.ticket.upsert({
      where: { ticketNumber: "BL-1001" },
      update: {},
      create: {
        ticketNumber: "BL-1001",
        authorId: priyaAuthor.id,
        bookId: book1.id,
        subject: "Quarterly royalty query for Q3 payout",
        description: "Hello BookLeaf support, I noticed that my pending royalty of ₹3,570 for 'Whispers of the Ganges' is currently accumulated. Could you please confirm if this will be included in the upcoming quarterly payout cycle to my linked account?",
        category: "Royalty & Payments",
        priority: "Medium",
        classificationReason: "Author inquiring about quarterly royalty payout schedule and pending balance ₹3,570.",
        suggestedNextStep: "Verify bank account linkage and confirm Q3 45-day payout cycle schedule.",
        status: "In Progress",
        assignedAdminId: adminUser.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    });

    // Public conversation message from author
    await prisma.ticketMessage.createMany({
      data: [
        {
          ticketId: ticket1.id,
          senderId: priyaAuthor.userId,
          body: ticket1.description,
          visibility: "PUBLIC",
          createdAt: ticket1.createdAt,
        },
        {
          ticketId: ticket1.id,
          senderId: adminUser.id,
          body: "Hello Priya,\n\nThank you for reaching out to BookLeaf Publishing. As per our royalty policy, royalties are calculated quarterly and disbursed within 45 days of the quarter ending. Your pending balance of ₹3,570 exceeds the ₹1,000 threshold and is scheduled for the upcoming disbursement run to your registered bank account. We have verified your account linkage, and we will update you as soon as the transfer reference is generated.\n\nWarm regards,\nBookLeaf Operations Team",
          visibility: "PUBLIC",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // Admin internal note (strictly secret from author)
    await prisma.ticketNote.create({
      data: {
        ticketId: ticket1.id,
        adminId: adminUser.id,
        body: "INTERNAL NOTE: Bank account verified on HDFC ending in 4102. Payout batch scheduled for next Monday.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });
  }

  if (snehaAuthor && snehaAuthor.books.length > 2) {
    const bookInProd = snehaAuthor.books.find(b => b.externalBookId === "BK013");
    if (bookInProd) {
      const ticket2 = await prisma.ticket.upsert({
        where: { ticketNumber: "BL-1002" },
        update: {},
        create: {
          ticketNumber: "BL-1002",
          authorId: snehaAuthor.id,
          bookId: bookInProd.id,
          subject: "Status of Cover Design proof for 'Midnight in Mysore'",
          description: "Hi BookLeaf team, my thriller 'Midnight in Mysore' has been in cover design for nearly 2 weeks now. Could you share an update on when the proofs will be ready for my review?",
          category: "Book Status & Production Updates",
          priority: "Medium",
          classificationReason: "Query regarding ongoing cover design timeline for a book currently in production.",
          suggestedNextStep: "Check with design studio queue and provide realistic 48-hour timeline for proof delivery.",
          status: "Open",
          assignedAdminId: null,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      });

      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket2.id,
          senderId: snehaAuthor.userId,
          body: ticket2.description,
          visibility: "PUBLIC",
          createdAt: ticket2.createdAt,
        },
      });
    }
  }

  if (ananyaAuthor) {
    const ticket3 = await prisma.ticket.upsert({
      where: { ticketNumber: "BL-1003" },
      update: {},
      create: {
        ticketNumber: "BL-1003",
        authorId: ananyaAuthor.id,
        bookId: null, // General / Account Level ticket!
        subject: "Updating bank account for royalty disbursement",
        description: "I recently switched my primary savings account to Axis Bank. How can I submit the updated IFSC and account details so my pending ₹2,546 royalty reaches the correct account?",
        category: "Royalty & Payments",
        priority: "High",
        classificationReason: "Banking information update request directly affecting royalty disbursements.",
        suggestedNextStep: "Provide secure bank account update procedure and confirm pending balance status.",
        status: "Resolved",
        assignedAdminId: admin2.id,
        resolvedAt: new Date(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.ticketMessage.createMany({
      data: [
        {
          ticketId: ticket3.id,
          senderId: ananyaAuthor.userId,
          body: ticket3.description,
          visibility: "PUBLIC",
          createdAt: ticket3.createdAt,
        },
        {
          ticketId: ticket3.id,
          senderId: admin2.id,
          body: "Hello Ananya,\n\nWe have updated your payout records with your verified Axis Bank details. Your accumulated pending royalty of ₹2,546 will be processed to this new account in the upcoming payout window. Thank you for notifying us promptly!\n\nBest regards,\nVikas Sharma\nBookLeaf Operations",
          visibility: "PUBLIC",
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
