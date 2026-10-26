"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Send,
  User,
  Shield,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  History,
  Radio,
  FileEdit,
  UserCheck,
} from "lucide-react";
import { Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, PRIORITIES, TICKET_STATUSES } from "@/lib/ai/knowledgeBase";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface TicketMessage {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

interface TicketNote {
  id: string;
  body: string;
  createdAt: string;
  admin: {
    name: string;
    email: string;
  };
}

interface TicketAuditLog {
  id: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
  actor: {
    name: string;
  };
}

interface TicketDetailAdmin {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  classificationReason: string | null;
  suggestedNextStep: string | null;
  assignedAdminId: string | null;
  assignedAdmin: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  author: {
    phone: string;
    city: string;
    joinedDate: string;
    externalAuthorId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  book?: {
    id: string;
    externalBookId: string;
    title: string;
    isbn: string;
    status: string;
    mrp: number | null;
    totalRoyaltyEarned: number;
    royaltyPending: number;
    totalCopiesSold: number;
  } | null;
  messages: TicketMessage[];
  notes: TicketNote[];
  auditLogs: TicketAuditLog[];
}

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetailAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);

  // Response composer
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Internal notes
  const [noteBody, setNoteBody] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // AI Actions
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  const [aiDraftSummary, setAiDraftSummary] = useState<string | null>(null);

  // Real-time status
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"conversation" | "notes" | "audit">("conversation");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
      } else if (res.status === 404) {
        router.push("/admin/tickets");
      }
    } catch (err) {
      console.error("Error fetching ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  // Real-time Server-Sent Events (SSE)
  useEffect(() => {
    if (!ticketId) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/tickets/${ticketId}/stream`);

      eventSource.onopen = () => setRealtimeConnected(true);

      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);

          if (payload.type === "CONNECTED") {
            setRealtimeConnected(true);
          }

          if (payload.type === "NEW_MESSAGE") {
            const { message, ticketStatus } = payload.data;
            setTicket((prev) => {
              if (!prev) return prev;
              const exists = prev.messages.some((m) => m.id === message.id);
              if (exists) return prev;
              return {
                ...prev,
                status: ticketStatus || prev.status,
                messages: [...prev.messages, message],
              };
            });
            setBannerNotice("New message added to conversation.");
            setTimeout(() => setBannerNotice(null), 4000);
          }

          if (payload.type === "STATUS_CHANGE") {
            const { status, category, priority, assignedAdmin } = payload.data;
            setTicket((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                status: status ?? prev.status,
                category: category ?? prev.category,
                priority: priority ?? prev.priority,
                assignedAdmin: assignedAdmin !== undefined ? assignedAdmin : prev.assignedAdmin,
              };
            });
            setBannerNotice("Ticket attributes updated.");
            setTimeout(() => setBannerNotice(null), 4000);
          }
        } catch {
          // ignore keepalive
        }
      };

      eventSource.onerror = () => setRealtimeConnected(false);
    } catch (err) {
      console.error("SSE error:", err);
    }

    return () => {
      eventSource?.close();
    };
  }, [ticketId]);

  // Handle Status Change
  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Handle Category Override
  const handleCategoryOverride = async (newCategory: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory }),
      });
      if (res.ok) {
        setTicket((prev) => (prev ? { ...prev, category: newCategory } : prev));
      }
    } catch (err) {
      console.error("Error updating category:", err);
    }
  };

  // Handle Priority Override
  const handlePriorityOverride = async (newPriority: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        setTicket((prev) => (prev ? { ...prev, priority: newPriority } : prev));
      }
    } catch (err) {
      console.error("Error updating priority:", err);
    }
  };

  // Generate AI Draft
  const handleGenerateAIDraft = async () => {
    setGeneratingDraft(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/ai-draft`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setReplyBody(data.draft.draftReply);
        setAiDraftSummary(data.draft.internalSummary);
      }
    } catch (err) {
      console.error("Error generating AI draft:", err);
    } finally {
      setGeneratingDraft(false);
    }
  };

  // Trigger AI Re-classification
  const handleReclassify = async () => {
    setReclassifying(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/ai-classification`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                category: data.classification.category,
                priority: data.classification.priority,
                classificationReason: data.classification.reasoning,
                suggestedNextStep: data.classification.suggestedNextStep,
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Error reclassifying:", err);
    } finally {
      setReclassifying(false);
    }
  };

  // Send Public Response to Author
  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setReplyBody("");
        setAiDraftSummary(null);
        setTicket((prev) => {
          if (!prev) return prev;
          const exists = prev.messages.some((m) => m.id === data.message.id);
          if (exists) return prev;
          return {
            ...prev,
            status: "In Progress",
            messages: [...prev.messages, data.message],
          };
        });
      }
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  // Add Internal Note (Strictly hidden from Author)
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;

    setAddingNote(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: noteBody.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setNoteBody("");
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                notes: [data.note, ...prev.notes],
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent" />
        <p className="mt-2 text-xs text-charcoal-muted">Loading ticket workspace...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <p className="text-sm text-charcoal">Support ticket not found.</p>
        <Link href="/admin/tickets" className="mt-2 inline-block text-xs text-purple-700 underline">
          Return to queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E6E1D8] pb-4">
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted hover:text-purple-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Ticket Queue
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              realtimeConnected
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <Radio className={`h-3 w-3 ${realtimeConnected ? "animate-pulse text-emerald-600" : "text-amber-600"}`} />
            <span>{realtimeConnected ? "Operations Stream Active" : "Reconnecting..."}</span>
          </span>
        </div>
      </div>

      {bannerNotice && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-xs text-purple-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-purple-700" />
          <span className="font-semibold">{bannerNotice}</span>
        </div>
      )}

      {/* Main Workspace Grid (3 columns on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Conversation, AI Draft & Notes (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header Card */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-bold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-100">
                {ticket.ticketNumber}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{ticket.priority}</Badge>
                <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-forest-950 editorial-title">
              {ticket.subject}
            </h1>

            <div className="mt-4 rounded-xl border border-[#F4EFE7] bg-ivory-50/60 p-4 text-sm text-charcoal whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {/* AI Response Drafting Assistant Box */}
          <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-800">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-purple-950">
                    BookLeaf AI Response Drafting Assistant
                  </h2>
                  <p className="text-[11px] text-charcoal-muted">
                    Calibrated on BookLeaf Knowledge Base (80/20 royalty, 45-day cycle, ₹1000 threshold, reprint protocol).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAIDraft}
                disabled={generatingDraft}
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-900 hover:bg-purple-100 transition-colors disabled:opacity-50 shrink-0"
              >
                <Sparkles className={`h-3.5 w-3.5 ${generatingDraft ? "animate-spin" : ""}`} />
                <span>{generatingDraft ? "Drafting..." : "Generate AI Draft"}</span>
              </button>
            </div>

            {aiDraftSummary && (
              <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-xs text-purple-950">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-purple-700 block mb-0.5">
                  Internal Policy Analysis:
                </span>
                {aiDraftSummary}
              </div>
            )}

            <form onSubmit={handleSendResponse} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={7}
                  required
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Click 'Generate AI Draft' to produce a response adhering to BookLeaf policies, or draft a custom response here. You can edit before sending..."
                  className="w-full rounded-xl border border-[#DCD0C0] bg-white p-3.5 text-sm text-charcoal placeholder-[#8A9992] focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 resize-y font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-charcoal-muted">
                  Sending this response delivers it directly to the author in real time.
                </span>
                <Button
                  type="submit"
                  loading={sendingReply}
                  size="sm"
                  className="bg-purple-900 hover:bg-purple-950 text-white px-5"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send Official Response
                </Button>
              </div>
            </form>
          </div>

          {/* Conversation & Internal Notes Tabs */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-white shadow-sm overflow-hidden">
            <div className="flex border-b border-[#E6E1D8] bg-ivory-50/50 px-4">
              <button
                onClick={() => setActiveTab("conversation")}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === "conversation"
                    ? "border-purple-900 text-purple-900"
                    : "border-transparent text-charcoal-muted hover:text-charcoal"
                }`}
              >
                <span>Author Conversation</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-full">
                  {ticket.messages.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === "notes"
                    ? "border-purple-900 text-purple-900"
                    : "border-transparent text-charcoal-muted hover:text-charcoal"
                }`}
              >
                <Lock className="h-3 w-3 text-amber-700" />
                <span>Internal Notes (Admin Only)</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">
                  {ticket.notes.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("audit")}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === "audit"
                    ? "border-purple-900 text-purple-900"
                    : "border-transparent text-charcoal-muted hover:text-charcoal"
                }`}
              >
                <History className="h-3 w-3" />
                <span>Audit Trail</span>
              </button>
            </div>

            <div className="p-6">
              {/* Conversation Tab */}
              {activeTab === "conversation" && (
                <div className="space-y-4">
                  {ticket.messages.map((message) => {
                    const isAdmin = message.sender.role === "ADMIN";
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3.5 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                            isAdmin ? "bg-purple-800" : "bg-forest-700"
                          }`}
                        >
                          {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                            isAdmin
                              ? "rounded-tr-none bg-purple-900 text-white"
                              : "rounded-tl-none bg-ivory-50 border border-[#E6E1D8] text-charcoal"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-black/5">
                            <span
                              className={`text-xs font-semibold ${
                                isAdmin ? "text-purple-100" : "text-forest-900"
                              }`}
                            >
                              {isAdmin ? message.sender.name : `${ticket.author.user.name} (Author)`}
                            </span>
                            <span
                              className={`text-[10px] ${
                                isAdmin ? "text-purple-200" : "text-charcoal-muted"
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed">{message.body}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Internal Notes Tab (Never emitted or shown to Author) */}
              {activeTab === "notes" && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>
                      Internal notes are visible ONLY to authorized BookLeaf operations personnel. Authors will never see this tab.
                    </span>
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      rows={3}
                      required
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Add an internal note (e.g. Bank IFSC verified, reprint order #9420 dispatched)..."
                      className="w-full rounded-xl border border-[#DCD0C0] bg-white p-3 text-xs text-charcoal focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                    <div className="text-right">
                      <Button
                        type="submit"
                        loading={addingNote}
                        size="sm"
                        className="bg-amber-800 hover:bg-amber-900 text-white"
                      >
                        Add Internal Note
                      </Button>
                    </div>
                  </form>

                  <div className="divide-y divide-[#F4EFE7]">
                    {ticket.notes.length === 0 ? (
                      <p className="text-xs text-charcoal-muted italic py-4 text-center">
                        No internal notes recorded yet for this ticket.
                      </p>
                    ) : (
                      ticket.notes.map((note) => (
                        <div key={note.id} className="py-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-charcoal-muted">
                            <span className="font-semibold text-charcoal">{note.admin.name}</span>
                            <span>{new Date(note.createdAt).toLocaleString("en-IN")}</span>
                          </div>
                          <p className="text-xs text-charcoal bg-ivory-50/60 p-2.5 rounded-lg border border-[#F4EFE7] whitespace-pre-wrap">
                            {note.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Audit Log Tab */}
              {activeTab === "audit" && (
                <div className="space-y-3">
                  {ticket.auditLogs.length === 0 ? (
                    <p className="text-xs text-charcoal-muted italic py-4 text-center">
                      No state changes recorded yet.
                    </p>
                  ) : (
                    ticket.auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between rounded-lg border border-[#F4EFE7] p-2.5 text-xs bg-ivory-50/40"
                      >
                        <div>
                          <span className="font-semibold text-charcoal">{log.action}:</span>{" "}
                          <span className="text-charcoal-muted">
                            {log.previousValue ? `${log.previousValue} → ` : ""}
                            <span className="font-medium text-purple-900">{log.newValue}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-charcoal-muted shrink-0">
                          {new Date(log.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Controls, AI Overrides, Author & Book Details (1 col) */}
        <div className="space-y-6">
          {/* Quick Status & Assignment Controls */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
              Ticket Operations Controls
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">
                Status
              </label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full rounded-lg border border-[#DCD0C0] bg-white px-3 py-2 text-xs font-semibold text-charcoal focus:border-purple-600 focus:outline-none"
              >
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">
                Assigned Administrator
              </label>
              <div className="text-xs font-medium text-charcoal p-2 rounded-lg bg-ivory-50 border border-[#F4EFE7] flex items-center justify-between">
                <span>{ticket.assignedAdmin ? ticket.assignedAdmin.name : "Unassigned"}</span>
                <UserCheck className="h-4 w-4 text-purple-700" />
              </div>
            </div>
          </div>

          {/* AI Intelligence & Overrides Card */}
          <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-700" /> AI Classification
              </span>
              <button
                type="button"
                onClick={handleReclassify}
                disabled={reclassifying}
                className="text-[11px] font-semibold text-purple-700 hover:text-purple-950 inline-flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${reclassifying ? "animate-spin" : ""}`} />
                Re-classify
              </button>
            </div>

            {/* Category Override */}
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">
                Category (Admin Override)
              </label>
              <select
                value={ticket.category}
                onChange={(e) => handleCategoryOverride(e.target.value)}
                className="w-full rounded-lg border border-[#DCD0C0] bg-white px-3 py-2 text-xs text-charcoal focus:border-purple-600 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Override */}
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">
                Priority Score (Admin Override)
              </label>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityOverride(e.target.value)}
                className="w-full rounded-lg border border-[#DCD0C0] bg-white px-3 py-2 text-xs text-charcoal focus:border-purple-600 focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Reasoning */}
            {ticket.classificationReason && (
              <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs text-purple-900">
                <p className="font-semibold text-[10px] uppercase tracking-wider text-purple-700 mb-0.5">
                  AI Classification Logic:
                </p>
                {ticket.classificationReason}
              </div>
            )}

            {/* AI Suggested Next Step */}
            {ticket.suggestedNextStep && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-900">
                <p className="font-semibold text-[10px] uppercase tracking-wider text-emerald-700 mb-0.5">
                  Suggested Action:
                </p>
                {ticket.suggestedNextStep}
              </div>
            )}
          </div>

          {/* Author Profile Information */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
              Author Information
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Name:</span>
                <span className="font-semibold text-charcoal">{ticket.author.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Email:</span>
                <span className="font-mono text-[11px] text-charcoal">{ticket.author.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Phone:</span>
                <span className="text-charcoal">{ticket.author.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">City:</span>
                <span className="text-charcoal">{ticket.author.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Author ID:</span>
                <span className="font-mono font-bold text-forest-800">
                  {ticket.author.externalAuthorId}
                </span>
              </div>
            </div>
          </div>

          {/* Book Information (If linked) */}
          {ticket.book && (
            <div className="rounded-2xl border border-[#E6E1D8] bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                Related Book Record
              </h3>
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-forest-950">{ticket.book.title}</p>
                <p className="font-mono text-[11px] text-charcoal-muted">ISBN: {ticket.book.isbn}</p>
                <div className="pt-2 border-t border-[#F4EFE7] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Production Status:</span>
                    <span className="font-medium text-charcoal">{ticket.book.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Total Copies Sold:</span>
                    <span className="font-bold text-charcoal">{ticket.book.totalCopiesSold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Pending Royalty:</span>
                    <span className="font-bold text-amber-800">
                      ₹{ticket.book.royaltyPending.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
