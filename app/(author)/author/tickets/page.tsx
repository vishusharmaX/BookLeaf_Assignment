"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, PlusCircle, Filter, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from "@/components/ui/Badge";

interface AuthorTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  book?: {
    id: string;
    title: string;
    isbn: string;
  } | null;
  messages: Array<{
    sender: { name: string; role: string };
  }>;
}

export default function AuthorTicketsPage() {
  const [tickets, setTickets] = useState<AuthorTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const url = statusFilter === "ALL" ? "/api/tickets" : `/api/tickets?status=${encodeURIComponent(statusFilter)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const filterTabs = [
    { label: "All Tickets", value: "ALL" },
    { label: "Open", value: "Open" },
    { label: "In Progress", value: "In Progress" },
    { label: "Resolved", value: "Resolved" },
    { label: "Closed", value: "Closed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E6E1D8] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-950 editorial-title">
            My Support Queries
          </h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Track your communication with the BookLeaf operations team in real time.
          </p>
        </div>
        <Link
          href="/author/tickets/new"
          className="inline-flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-forest-800 transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Support Query</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E6E1D8] pb-3">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === tab.value
                ? "bg-forest-800 text-white shadow-sm"
                : "bg-white text-charcoal hover:bg-ivory-100 border border-[#E6E1D8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[#E6E1D8] bg-white p-5 h-24" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E6E1D8] bg-white p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-charcoal-muted opacity-40 mb-3" />
          <h3 className="text-base font-bold text-charcoal">No support queries found</h3>
          <p className="text-xs text-charcoal-muted mt-1">
            {statusFilter !== "ALL"
              ? `There are currently no tickets with status "${statusFilter}".`
              : "You have not raised any support queries yet."}
          </p>
          <Link
            href="/author/tickets/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-xs font-semibold text-white hover:bg-forest-800"
          >
            <PlusCircle className="h-4 w-4" />
            Create Your First Query
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/author/tickets/${t.id}`}
              className="block rounded-2xl border border-[#E6E1D8] bg-white p-5 shadow-sm hover:border-forest-500 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                      {t.ticketNumber}
                    </span>
                    <Badge variant={getStatusBadgeVariant(t.status)}>{t.status}</Badge>
                    <span className="text-xs font-medium text-forest-800 bg-forest-50/70 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-charcoal group-hover:text-forest-900 transition-colors">
                    {t.subject}
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    Regarding:{" "}
                    <span className="font-medium text-charcoal">
                      {t.book ? t.book.title : "General / Account Level"}
                    </span>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0 space-y-1">
                  <div className="flex items-center gap-1 text-xs text-charcoal-muted sm:justify-end">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Updated {new Date(t.updatedAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 group-hover:underline">
                    Open Conversation <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
