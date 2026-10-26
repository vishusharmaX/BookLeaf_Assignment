"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, UploadCloud, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AuthorBookOption {
  id: string;
  title: string;
  isbn: string;
  status: string;
}

export default function NewTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBookId = searchParams.get("bookId") || "";

  const [books, setBooks] = useState<AuthorBookOption[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const [selectedBookId, setSelectedBookId] = useState(preselectedBookId);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        if (data.books) {
          setBooks(data.books);
          if (preselectedBookId) {
            setSelectedBookId(preselectedBookId);
          }
        }
      })
      .catch((err) => console.error("Error loading author books:", err))
      .finally(() => setLoadingBooks(false));
  }, [preselectedBookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBookId === "" ? null : selectedBookId,
          subject,
          description,
          attachmentUrl: attachmentName ? `https://storage.bookleaf.in/uploads/${attachmentName}` : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create support query.");
      }

      // Immediately navigate to the ticket conversation
      router.push(`/author/tickets/${data.ticket.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting ticket");
      setSubmitting(false);
    }
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/author/tickets"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted hover:text-forest-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to My Tickets
      </Link>

      {/* Header */}
      <div className="border-b border-[#E6E1D8] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-forest-950 editorial-title">
          Submit a Support Query
        </h1>
        <p className="text-sm text-charcoal-muted mt-1">
          Our operations team and AI support assistant will review your query and provide a swift resolution.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Book Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-2">
              Select Related Book
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              disabled={loadingBooks}
              className="w-full rounded-lg border border-[#DCD0C0] bg-white px-3.5 py-2.5 text-sm text-charcoal focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
            >
              <option value="">General / Account Level (Not Book Specific)</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} (ISBN: {b.isbn}) — {b.status}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-charcoal-muted">
              Choose &quot;General / Account Level&quot; for payout banking updates or generic profile questions.
            </p>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-2">
              Subject Line
            </label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={150}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Quarterly royalty payout inquiry for Whispers of the Ganges"
              className="w-full rounded-lg border border-[#DCD0C0] bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder-[#8A9992] focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-2">
              Query Description
            </label>
            <textarea
              required
              rows={6}
              minLength={15}
              maxLength={3000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your query in detail. Include any relevant dates, order numbers, or retail platform links..."
              className="w-full rounded-lg border border-[#DCD0C0] bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder-[#8A9992] focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600 resize-y"
            />
            <p className="mt-1 text-xs text-charcoal-muted flex justify-between">
              <span>Be as specific as possible to accelerate resolution.</span>
              <span>{description.length} / 3000</span>
            </p>
          </div>

          {/* File Attachment UI (Bonus feature requested in prompt & PDF) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-2">
              Optional Attachment (Photos of print defects, bank statements, proofs)
            </label>
            <div className="rounded-xl border-2 border-dashed border-[#DCD0C0] p-6 text-center hover:border-forest-500 hover:bg-forest-50/20 transition-all relative">
              <input
                type="file"
                onChange={handleSimulatedFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto h-8 w-8 text-forest-700 mb-2" />
              {attachmentName ? (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-forest-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Attached: {attachmentName}</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-charcoal">
                    Click to browse or drag and drop files here
                  </p>
                  <p className="text-[11px] text-charcoal-muted mt-0.5">
                    Supports JPG, PNG, PDF up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#F4EFE7] flex items-center justify-between">
            <Link
              href="/author/tickets"
              className="text-xs font-medium text-charcoal-muted hover:text-charcoal"
            >
              Cancel
            </Link>
            <Button type="submit" loading={submitting} className="px-6 py-2.5">
              Submit Support Query
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
