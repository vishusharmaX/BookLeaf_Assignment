"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, BookOpen, ExternalLink, PlusCircle, AlertCircle, Eye } from "lucide-react";
import { BookDetailsModal, BookModalData } from "@/components/books/BookDetailsModal";

export default function AuthorBooksPage() {
  const [books, setBooks] = useState<BookModalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"date" | "title" | "sold" | "royalty">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedBook, setSelectedBook] = useState<BookModalData | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/books?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBooks();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, statusFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E6E1D8] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-950 editorial-title">
            My Books
          </h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Complete catalogue of your published titles, works in production, and platform sales.
          </p>
        </div>
        <Link
          href="/author/tickets/new"
          className="inline-flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-forest-800 transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Raise Book Query</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[#E6E1D8] bg-white p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, genre, or ISBN..."
            className="w-full rounded-lg border border-[#DCD0C0] bg-white pl-9 pr-3.5 py-2 text-sm text-charcoal placeholder-[#8A9992] focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8A9992]" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="h-4 w-4 text-charcoal-muted" />
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              Status:
            </span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#DCD0C0] bg-white px-3 py-2 text-sm text-charcoal focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Published & Live">Published & Live</option>
            <option value="In Production - Cover Design">In Production - Cover Design</option>
            <option value="In Production - Typesetting">In Production - Typesetting</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "title" | "sold" | "royalty")}
            className="rounded-lg border border-[#DCD0C0] bg-white px-3 py-2 text-sm text-charcoal focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
          >
            <option value="date">Sort: Publication Date</option>
            <option value="sold">Sort: Total Copies Sold</option>
            <option value="royalty">Sort: Royalties Earned</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Book Cards Listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[#E6E1D8] bg-white p-6 h-64" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E6E1D8] bg-white p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-charcoal-muted opacity-40 mb-3" />
          <h3 className="text-base font-bold text-charcoal">No books match your criteria</h3>
          <p className="text-xs text-charcoal-muted mt-1">Try clearing your filters or search term.</p>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            className="mt-4 rounded-lg bg-forest-100 px-3.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const isLive = book.status === "Published & Live";
            return (
              <div
                key={book.id}
                className="rounded-2xl border border-[#E6E1D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Status & ID */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                      {book.externalBookId}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        isLive
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {book.status}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <h3 className="text-lg font-bold text-forest-950 editorial-title leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-1">
                    {book.genre} • ISBN: <span className="font-mono text-charcoal">{book.isbn}</span>
                  </p>

                  {/* Commercials Summary */}
                  <div className="mt-4 rounded-xl border border-[#F4EFE7] bg-ivory-50/60 p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal-muted">MRP:</span>
                      <span className="font-semibold text-charcoal">
                        {book.mrp !== null ? `₹${book.mrp}` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal-muted">Copies Sold:</span>
                      <span className="font-bold text-charcoal">
                        {book.totalCopiesSold.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#EAE3D6] pt-1.5">
                      <span className="text-charcoal-muted">Earned / Pending:</span>
                      <span className="font-semibold text-forest-900">
                        ₹{book.totalRoyaltyEarned.toLocaleString("en-IN")} /{" "}
                        <span className="text-amber-800">₹{book.royaltyPending.toLocaleString("en-IN")}</span>
                      </span>
                    </div>
                  </div>

                  {/* Platforms / Production status notice */}
                  <div className="mt-4">
                    {isLive ? (
                      <div className="flex flex-wrap gap-1.5">
                        {book.availableOnList?.slice(0, 3).map((platform) => (
                          <span
                            key={platform}
                            className="rounded bg-ivory-100 px-2 py-0.5 text-[11px] font-medium text-charcoal"
                          >
                            {platform}
                          </span>
                        ))}
                        {book.availableOnList?.length > 3 && (
                          <span className="rounded bg-ivory-100 px-1.5 py-0.5 text-[11px] text-charcoal-muted">
                            +{book.availableOnList.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-800 font-medium bg-amber-50 rounded-lg p-2 border border-amber-100">
                        ⏳ Milestone: In production queue
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 pt-4 border-t border-[#F4EFE7] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-900 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details</span>
                  </button>

                  <Link
                    href={`/author/tickets/new?bookId=${book.id}`}
                    className="rounded-lg bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-100 transition-colors"
                  >
                    Raise Query
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Details Modal */}
      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}
