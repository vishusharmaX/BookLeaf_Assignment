"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  User,
  Shield,
  Clock,
  Radio,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  book?: {
    id: string;
    title: string;
    isbn: string;
    status: string;
  } | null;
  messages: TicketMessage[];
}

export default function AuthorTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [newActivityAlert, setNewActivityAlert] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
      } else if (res.status === 404 || res.status === 403) {
        router.push("/author/tickets");
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

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  // Server-Sent Events (SSE) Real-Time Connection
  useEffect(() => {
    if (!ticketId) return;

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(`/api/tickets/${ticketId}/stream`);

      eventSource.onopen = () => {
        setRealtimeConnected(true);
      };

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
            setNewActivityAlert("New response received from BookLeaf Support!");
            setTimeout(() => setNewActivityAlert(null), 4000);
          }

          if (payload.type === "STATUS_CHANGE") {
            const { status } = payload.data;
            setTicket((prev) => (prev ? { ...prev, status } : prev));
            setNewActivityAlert(`Ticket status updated to ${status}`);
            setTimeout(() => setNewActivityAlert(null), 4000);
          }
        } catch {
          // Non-JSON ping
        }
      };

      eventSource.onerror = () => {
        setRealtimeConnected(false);
      };
    } catch (err) {
      console.error("SSE connection error:", err);
    }

    return () => {
      eventSource?.close();
    };
  }, [ticketId]);

  const handleSendReply = async (e: React.FormEvent) => {
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
        // Optimistically add message if not already added by SSE
        setTicket((prev) => {
          if (!prev) return prev;
          const exists = prev.messages.some((m) => m.id === data.message.id);
          if (exists) return prev;
          return {
            ...prev,
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-forest-600 border-r-transparent" />
        <p className="mt-2 text-xs text-charcoal-muted">Loading conversation...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-sm text-charcoal">Support query not found.</p>
        <Link href="/author/tickets" className="mt-2 inline-block text-xs text-forest-700 underline">
          Return to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E6E1D8] pb-4">
        <Link
          href="/author/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted hover:text-forest-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Tickets
        </Link>

        {/* Real-time connection badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              realtimeConnected
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <Radio className={`h-3 w-3 ${realtimeConnected ? "animate-pulse text-emerald-600" : "text-amber-600"}`} />
            <span>{realtimeConnected ? "Live Updates Active" : "Connecting..."}</span>
          </span>
        </div>
      </div>

      {/* Real-time Activity Banner Alert */}
      {newActivityAlert && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{newActivityAlert}</span>
        </div>
      )}

      {/* Ticket Header Card */}
      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded border border-forest-100">
                {ticket.ticketNumber}
              </span>
              <Badge variant={getStatusBadgeVariant(ticket.status)}>
                {ticket.status}
              </Badge>
              <span className="text-xs font-semibold text-forest-800 bg-forest-50/70 px-2.5 py-0.5 rounded">
                Category: {ticket.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-forest-950 editorial-title">
              {ticket.subject}
            </h1>
            <p className="text-xs text-charcoal-muted">
              Submitted on {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {ticket.book && (
            <div className="rounded-xl border border-[#F4EFE7] bg-ivory-50/70 p-3 sm:text-right shrink-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted">
                Related Book
              </p>
              <p className="text-xs font-bold text-charcoal mt-0.5">{ticket.book.title}</p>
              <p className="text-[11px] text-charcoal-muted font-mono">{ticket.book.isbn}</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
          Conversation Thread ({ticket.messages.length} messages)
        </h2>

        <div className="space-y-4">
          {ticket.messages.map((message) => {
            const isAdmin = message.sender.role === "ADMIN";
            return (
              <div
                key={message.id}
                className={`flex gap-3.5 ${isAdmin ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                    isAdmin ? "bg-purple-800" : "bg-forest-700"
                  }`}
                >
                  {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm shadow-sm ${
                    isAdmin
                      ? "rounded-tl-none bg-white border border-purple-100 text-charcoal"
                      : "rounded-tr-none bg-forest-800 text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-black/5">
                    <span
                      className={`text-xs font-semibold ${
                        isAdmin ? "text-purple-900" : "text-emerald-100"
                      }`}
                    >
                      {isAdmin ? "BookLeaf Operations Desk" : "You (Author)"}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isAdmin ? "text-charcoal-muted" : "text-emerald-200"
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
      </div>

      {/* Author Reply Composer */}
      {ticket.status !== "Closed" ? (
        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-5 shadow-sm">
          <form onSubmit={handleSendReply} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              Add Follow-up Message
            </label>
            <textarea
              required
              rows={4}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Type your response to the operations desk..."
              className="w-full rounded-xl border border-[#DCD0C0] bg-white p-3 text-sm text-charcoal placeholder-[#8A9992] focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600 resize-y"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-charcoal-muted">
                Replies are delivered in real time to the assigned operations officer.
              </span>
              <Button type="submit" loading={sendingReply} size="sm" className="px-5">
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send Reply
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-xs text-charcoal-muted">
          This support query has been resolved and closed. If you have an additional inquiry, please submit a new query.
        </div>
      )}
    </div>
  );
}
