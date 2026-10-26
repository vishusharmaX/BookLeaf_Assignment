"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  AlertCircle,
  Inbox,
  UserCheck,
} from "lucide-react";
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from "@/components/ui/Badge";
import { CATEGORIES, PRIORITIES, TICKET_STATUSES } from "@/lib/ai/knowledgeBase";

interface AdminTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: {
    user: {
      name: string;
      email: string;
    };
  };
  book?: {
    id: string;
    title: string;
    isbn: string;
  } | null;
  assignedAdmin?: {
    id: string;
    name: string;
  } | null;
  _count: {
    notes: number;
    messages: number;
  };
}

export default function AdminTicketQueuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState<AdminTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [priority, setPriority] = useState(searchParams.get("priority") || "ALL");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "15");
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      if (category !== "ALL") params.set("category", category);
      if (priority !== "ALL") params.set("priority", priority);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
        setTotalCount(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching admin tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchTickets();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, status, category, priority, page]);

  const handleClearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setCategory("ALL");
    setPriority("ALL");
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" || status !== "ALL" || category !== "ALL" || priority !== "ALL";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E6E1D8] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-950 editorial-title">
            Support Ticket Queue
          </h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Incoming queries across all authors. Review AI classifications, assign officers, and resolve inquiries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-900 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
            {totalCount} Total Inquiries
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search author, email, ticket..."
              className="w-full rounded-lg border border-[#DCD0C0] bg-white pl-9 pr-3.5 py-2 text-xs text-charcoal placeholder-[#8A9992] focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A9992]" />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#DCD0C0] bg-white px-3 py-2 text-xs text-charcoal focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
          >
            <option value="ALL">All Statuses</option>
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#DCD0C0] bg-white px-3 py-2 text-xs text-charcoal focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#DCD0C0] bg-white px-3 py-2 text-xs text-charcoal focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
          >
            <option value="ALL">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t border-[#F4EFE7] pt-3 text-xs">
            <span className="text-charcoal-muted">
              Filtering results • {totalCount} matching
            </span>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:text-purple-900"
            >
              <X className="h-3.5 w-3.5" /> Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Ticket Table */}
      <div className="rounded-2xl border border-[#E6E1D8] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6E1D8] bg-ivory-50 text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Subject & Book</th>
                <th className="py-3 px-4">AI Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE7]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-charcoal-muted">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-r-transparent" />
                    <p className="mt-2 text-xs">Loading queue...</p>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-charcoal-muted">
                    <Inbox className="mx-auto h-8 w-8 opacity-40 mb-2" />
                    <p className="font-semibold text-charcoal">No tickets found</p>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      No support tickets match the current queue filters.
                    </p>
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-ivory-50/70 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/admin/tickets/${t.id}`)}
                  >
                    {/* Ticket Reference */}
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900 whitespace-nowrap">
                      {t.ticketNumber}
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-charcoal">{t.author.user.name}</p>
                      <p className="text-[11px] text-charcoal-muted">{t.author.user.email}</p>
                    </td>

                    {/* Subject & Book */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-charcoal line-clamp-1 group-hover:text-purple-900 transition-colors">
                        {t.subject}
                      </p>
                      <p className="text-[11px] text-charcoal-muted mt-0.5">
                        {t.book ? t.book.title : "General / Account Level"}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="rounded bg-ivory-100 px-2 py-0.5 text-[11px] font-medium text-charcoal">
                        {t.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={getPriorityBadgeVariant(t.priority)}>{t.priority}</Badge>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(t.status)}>{t.status}</Badge>
                    </td>

                    {/* Assigned */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.assignedAdmin ? (
                        <span className="font-medium text-charcoal flex items-center gap-1">
                          <UserCheck className="h-3 w-3 text-purple-700" />
                          {t.assignedAdmin.name}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/tickets/${t.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-900 hover:bg-purple-100 transition-colors"
                      >
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E6E1D8] px-4 py-3 bg-ivory-50/40 text-xs">
            <span className="text-charcoal-muted">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[#DCD0C0] bg-white p-1.5 text-charcoal hover:bg-ivory-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-[#DCD0C0] bg-white p-1.5 text-charcoal hover:bg-ivory-100 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
