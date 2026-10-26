import Link from "next/link";
import { getAdminDashboardStats } from "@/services/admin/adminService";
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from "@/components/ui/Badge";
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserX,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const { metrics, oldestUnresolved, recentActivity, categoryBreakdown } =
    await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E6E1D8] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-950 editorial-title">
            Operations Support Command Center
          </h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Real-time author inquiry triage, AI classification analytics, and ticket queue management.
          </p>
        </div>
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-2 rounded-lg bg-purple-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-950 transition-colors shrink-0"
        >
          <Inbox className="h-4 w-4" />
          <span>View All Tickets ({metrics.totalActive} Active)</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Tickets */}
        <div className="rounded-xl border border-[#E6E1D8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              Awaiting Action
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-forest-950">{metrics.totalOpenTickets}</div>
            <p className="mt-1 text-xs text-amber-800 font-medium">New unassigned queries</p>
          </div>
        </div>

        {/* Critical & High Priority */}
        <div className="rounded-xl border border-red-200 bg-red-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              High & Critical
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-950">
              {metrics.criticalTickets + metrics.highTickets}
            </div>
            <p className="mt-1 text-xs text-red-700 font-medium">
              {metrics.criticalTickets} Critical • {metrics.highTickets} High Priority
            </p>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-[#E6E1D8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              In Progress
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-forest-950">{metrics.inProgressTickets}</div>
            <p className="mt-1 text-xs text-blue-700 font-medium">Under active investigation</p>
          </div>
        </div>

        {/* Resolved */}
        <div className="rounded-xl border border-[#E6E1D8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              Resolved Queries
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-950">{metrics.resolvedTickets}</div>
            <p className="mt-1 text-xs text-emerald-700 font-medium">Author issues resolved</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Oldest Unresolved & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Oldest Unresolved Tickets (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#E6E1D8] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-forest-950 editorial-title">
                Oldest Unresolved Tickets
              </h2>
              <p className="text-xs text-charcoal-muted">Prioritize these queries to satisfy author SLA</p>
            </div>
            <Link
              href="/admin/tickets?status=Open"
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              View Queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {oldestUnresolved.length === 0 ? (
            <p className="text-xs text-charcoal-muted italic py-6 text-center">
              No pending unresolved tickets! All author queries are answered.
            </p>
          ) : (
            <div className="divide-y divide-[#F4EFE7]">
              {oldestUnresolved.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/tickets/${t.id}`}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-ivory-50/70 -mx-2 px-2 rounded-lg transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {t.ticketNumber}
                      </span>
                      <Badge variant={getPriorityBadgeVariant(t.priority)}>{t.priority}</Badge>
                      <Badge variant={getStatusBadgeVariant(t.status)}>{t.status}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-charcoal group-hover:text-purple-900">
                      {t.subject}
                    </p>
                    <p className="text-xs text-charcoal-muted">
                      Author: <span className="font-medium text-charcoal">{t.author.user.name}</span> •{" "}
                      Book: {t.book ? t.book.title : "General Account"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-charcoal-muted font-medium">
                      Opened {new Date(t.createdAt).toLocaleDateString("en-IN")}
                    </p>
                    <span className="text-[11px] font-semibold text-purple-700 group-hover:underline">
                      Review Ticket &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI Category Distribution (1 col) */}
        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-forest-950 editorial-title">
              Query Categories
            </h2>
            <p className="text-xs text-charcoal-muted">AI-classified distribution</p>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between rounded-xl border border-[#F4EFE7] bg-ivory-50/60 p-3"
              >
                <span className="text-xs font-medium text-charcoal">{cat.name}</span>
                <span className="font-bold text-xs bg-forest-100 text-forest-900 px-2 py-0.5 rounded-full">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#F4EFE7]">
            <p className="text-[11px] text-charcoal-muted">
              BookLeaf AI auto-categorizes inbound author tickets across all 6 approved publishing categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
