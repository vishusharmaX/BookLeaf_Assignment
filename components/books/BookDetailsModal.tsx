"use client";

import React from "react";
import Link from "next/link";
import { X, BookOpen, ExternalLink, Calendar, Printer, DollarSign, MessageSquare } from "lucide-react";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";

export interface BookModalData {
  id: string;
  externalBookId: string;
  title: string;
  isbn: string;
  genre: string;
  publicationDate: string | Date | null;
  status: string;
  mrp: number | null;
  authorRoyaltyPerCopy: number | null;
  totalCopiesSold: number;
  totalRoyaltyEarned: number;
  royaltyPaid: number;
  royaltyPending: number;
  lastRoyaltyPayoutDate: string | Date | null;
  printPartner: string | null;
  availableOnList: string[];
  tickets?: Array<{
    id: string;
    ticketNumber: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string | Date;
  }>;
}

interface BookDetailsModalProps {
  book: BookModalData | null;
  onClose: () => void;
}

export function BookDetailsModal({ book, onClose }: BookDetailsModalProps) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#E6E1D8] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F4EFE7] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                {book.externalBookId}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  book.status === "Published & Live"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {book.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-forest-950 editorial-title">{book.title}</h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Genre: {book.genre} • ISBN: <span className="font-mono text-charcoal">{book.isbn}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-charcoal-muted hover:bg-ivory-100 hover:text-charcoal transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6">
          {/* Commercial & Royalty Metrics Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-3 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-forest-700" /> Commercials & Royalties
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-[#F4EFE7] bg-ivory-50/70 p-3">
                <p className="text-[11px] text-charcoal-muted">MRP</p>
                <p className="text-sm font-bold text-charcoal mt-0.5">
                  {book.mrp !== null ? `₹${book.mrp}` : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-[#F4EFE7] bg-ivory-50/70 p-3">
                <p className="text-[11px] text-charcoal-muted">Royalty / Copy</p>
                <p className="text-sm font-bold text-charcoal mt-0.5">
                  {book.authorRoyaltyPerCopy !== null ? `₹${book.authorRoyaltyPerCopy}` : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-[#F4EFE7] bg-ivory-50/70 p-3">
                <p className="text-[11px] text-charcoal-muted">Copies Sold</p>
                <p className="text-sm font-bold text-charcoal mt-0.5">
                  {book.totalCopiesSold.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl border border-[#F4EFE7] bg-ivory-50/70 p-3">
                <p className="text-[11px] text-charcoal-muted">Total Earned</p>
                <p className="text-sm font-bold text-emerald-800 mt-0.5">
                  ₹{book.totalRoyaltyEarned.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#F4EFE7] bg-ivory-50/70 p-3">
                <p className="text-[11px] text-charcoal-muted">Royalty Disbursed</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">
                  ₹{book.royaltyPaid.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl border border-[#F4EFE7] bg-ivory-50/70 p-3">
                <p className="text-[11px] text-charcoal-muted">Royalty Pending</p>
                <p className="text-sm font-bold text-amber-800 mt-0.5">
                  ₹{book.royaltyPending.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl border border-[#F4EFE7] bg-ivory-50/70 p-3">
                <p className="text-[11px] text-charcoal-muted">Last Payout Date</p>
                <p className="text-sm font-bold text-charcoal mt-0.5">
                  {book.lastRoyaltyPayoutDate
                    ? new Date(book.lastRoyaltyPayoutDate).toLocaleDateString("en-IN")
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Publishing & Distribution Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-3 flex items-center gap-1.5">
              <Printer className="h-3.5 w-3.5 text-forest-700" /> Production & Distribution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-[#F4EFE7] bg-white p-3">
                <p className="text-charcoal-muted">Publication Date</p>
                <p className="font-semibold text-charcoal mt-1">
                  {book.publicationDate
                    ? new Date(book.publicationDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "In Production — Date pending proof approval"}
                </p>
              </div>
              <div className="rounded-xl border border-[#F4EFE7] bg-white p-3">
                <p className="text-charcoal-muted">Print Partner</p>
                <p className="font-semibold text-charcoal mt-1">
                  {book.printPartner || "In Production — Assigned at print stage"}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-[#F4EFE7] bg-white p-3">
              <p className="text-xs text-charcoal-muted mb-2">Retail Platforms</p>
              {book.availableOnList && book.availableOnList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {book.availableOnList.map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center gap-1 rounded-md bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-800 border border-forest-100"
                    >
                      <ExternalLink className="h-3 w-3" /> {platform}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-charcoal-muted italic">
                  Not yet listed on retail platforms (Currently in production pipeline).
                </p>
              )}
            </div>
          </div>

          {/* Related Support Queries */}
          {book.tickets && book.tickets.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-3 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-forest-700" /> Related Support Queries
              </h3>
              <div className="space-y-2">
                {book.tickets.map((t) => (
                  <Link
                    key={t.id}
                    href={`/author/tickets/${t.id}`}
                    className="flex items-center justify-between rounded-lg border border-[#F4EFE7] bg-ivory-50/50 p-2.5 hover:bg-ivory-100 transition-colors text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-forest-800 mr-2">
                        {t.ticketNumber}
                      </span>
                      <span className="font-semibold text-charcoal">{t.subject}</span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(t.status)}>{t.status}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 border-t border-[#F4EFE7] pt-4 flex items-center justify-between">
          <Link
            href={`/author/tickets/new?bookId=${book.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-forest-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-forest-800 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Raise Ticket for this Book
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg border border-[#DCD0C0] px-4 py-2 text-xs font-medium text-charcoal hover:bg-ivory-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
