import prisma from "@/lib/db/prisma";

export async function getAdminDashboardStats() {
  const [
    totalOpenTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    criticalTickets,
    highTickets,
    unassignedTickets,
    oldestUnresolved,
    recentActivity,
    categoryCounts,
  ] = await Promise.all([
    prisma.ticket.count({ where: { status: "Open" } }),
    prisma.ticket.count({ where: { status: "In Progress" } }),
    prisma.ticket.count({ where: { status: "Resolved" } }),
    prisma.ticket.count({ where: { status: "Closed" } }),
    prisma.ticket.count({
      where: {
        priority: "Critical",
        status: { in: ["Open", "In Progress"] },
      },
    }),
    prisma.ticket.count({
      where: {
        priority: "High",
        status: { in: ["Open", "In Progress"] },
      },
    }),
    prisma.ticket.count({
      where: {
        assignedAdminId: null,
        status: { in: ["Open", "In Progress"] },
      },
    }),
    prisma.ticket.findMany({
      where: {
        status: { in: ["Open", "In Progress"] },
      },
      orderBy: { createdAt: "asc" },
      take: 5,
      include: {
        author: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        book: { select: { title: true } },
      },
    }),
    prisma.ticket.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        author: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        book: { select: { title: true } },
        assignedAdmin: { select: { name: true } },
      },
    }),
    prisma.ticket.groupBy({
      by: ["category"],
      _count: { category: true },
    }),
  ]);

  return {
    metrics: {
      totalOpenTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      criticalTickets,
      highTickets,
      unassignedTickets,
      totalActive: totalOpenTickets + inProgressTickets,
    },
    oldestUnresolved,
    recentActivity,
    categoryBreakdown: categoryCounts.map((c) => ({
      name: c.category,
      count: c._count.category,
    })),
  };
}

export async function getAdminList() {
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });
}
