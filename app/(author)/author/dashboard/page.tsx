import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getAuthorDashboardStats } from "@/services/books/bookService";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import {
  BookMarked,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default async function AuthorDashboardPage() {
  const session = await getSession();
  if (!session?.authorId) return null;

  const { metrics, recentBooks, recentTickets } = await getAuthorDashboardStats(
    session.authorId
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E6E1D8] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-950 editorial-title">
            Author Overview
          </h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Welcome back, <span className="font-semibold text-charcoal">{session.name}</span>. Here is the operational summary of your published titles, royalties, and support queries.
          </p>
        </div>
        <Link
          href="/author/tickets/new"
          className="inline-flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-forest-800 transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Submit Support Query</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Books Card */}
        <div className="rounded-xl border border-[#E6E1D8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              Book Titles
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
              <BookMarked className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-forest-950">{metrics.totalBooks}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-charcoal-muted">
              <span className="text-emerald-700 font-medium">{metrics.publishedBooks} Live</span>
              <span>•</span>
              <span className="text-amber-700 font-medium">{metrics.inProductionBooks} In Production</span>
            </div>
          </div>
        </div>

        {/* Total Sold */}
        <div className="rounded-xl border border-[#E6E1D8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              Total Copies Sold
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-forest-950">
              {metrics.totalCopiesSold.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-charcoal-muted">Across Amazon, Flipkart & Store</p>
          </div>
        </div>

        {/* Royalty Earned & Paid */}
        <div className="rounded-xl border border-[#E6E1D8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              Total Royalties
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-forest-950">
              ₹{metrics.totalRoyaltyEarned.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>₹{metrics.totalRoyaltyPaid.toLocaleString("en-IN")} Disbursed</span>
            </div>
          </div>
        </div>

        {/* Royalty Pending / Open Tickets */}
        <div className="rounded-xl border border-[#E6E1D8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              Pending Royalty
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-900">
              ₹{metrics.totalRoyaltyPending.toLocaleString("en-IN")}
            </div>
            <p className="mt-1 text-xs text-charcoal-muted">
              {metrics.openTickets > 0 ? (
                <span className="text-forest-700 font-medium">{metrics.openTickets} active support query</span>
              ) : (
                "Next disbursement within 45 days of Q-end"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Books & Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Books */}
        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-forest-950 editorial-title">My Books</h2>
              <p className="text-xs text-charcoal-muted">Catalog snapshot & sales figures</p>
            </div>
            <Link
              href="/author/books"
              className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1"
            >
              View All ({metrics.totalBooks}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center justify-between rounded-xl border border-[#F4EFE7] bg-ivory-50/50 p-3.5 hover:bg-ivory-100 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-charcoal">{book.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        book.status === "Published & Live"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {book.status}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted font-mono">ISBN: {book.isbn}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-charcoal">
                    {book.totalCopiesSold} copies
                  </p>
                  <p className="text-xs text-forest-700 font-semibold">
                    ₹{book.totalRoyaltyEarned.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Support Tickets */}
        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-forest-950 editorial-title">
                Support Queries
              </h2>
              <p className="text-xs text-charcoal-muted">Recent communication with operations</p>
            </div>
            <Link
              href="/author/tickets"
              className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentTickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E6E1D8] p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-charcoal-muted opacity-40 mb-2" />
              <p className="text-sm font-medium text-charcoal">No open support tickets</p>
              <p className="text-xs text-charcoal-muted mt-1">
                Have questions regarding royalties, ISBNs, or print copies?
              </p>
              <Link
                href="/author/tickets/new"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:underline"
              >
                Create a new ticket <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/author/tickets/${ticket.id}`}
                  className="block rounded-xl border border-[#F4EFE7] bg-ivory-50/50 p-3.5 hover:bg-ivory-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-forest-800">
                      {ticket.ticketNumber}
                    </span>
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-charcoal line-clamp-1">
                    {ticket.subject}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal-muted">
                    <span>{ticket.book ? ticket.book.title : "General Account"}</span>
                    <span>{new Date(ticket.updatedAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
