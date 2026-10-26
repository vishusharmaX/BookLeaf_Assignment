"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  AlertCircle,
  Clock,
  Sparkles,
  BookMarked,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Operations Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/dashboard",
    },
    {
      name: "Ticket Queue",
      href: "/admin/tickets",
      icon: Inbox,
      active: pathname === "/admin/tickets",
    },
  ];

  const quickFilters = [
    {
      name: "Critical & High",
      href: "/admin/tickets?priority=Critical",
      icon: AlertCircle,
      color: "text-red-600",
    },
    {
      name: "Awaiting Action",
      href: "/admin/tickets?status=Open",
      icon: Clock,
      color: "text-amber-600",
    },
    {
      name: "In Progress",
      href: "/admin/tickets?status=In Progress",
      icon: Sparkles,
      color: "text-blue-600",
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-[#E6E1D8] bg-white hidden md:block min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted mb-2">
          Operations Desk
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                item.active
                  ? "bg-purple-900 text-white shadow-sm"
                  : "text-charcoal hover:bg-ivory-100 hover:text-purple-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${item.active ? "text-white" : "text-purple-700"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 border-t border-[#F4EFE7] pt-4">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted mb-2">
          Quick Filters
        </p>
        <div className="space-y-1">
          {quickFilters.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.name}
                href={q.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-charcoal hover:bg-ivory-100 transition-colors"
              >
                <Icon className={`h-3.5 w-3.5 ${q.color}`} />
                <span>{q.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-[#F4EFE7] pt-4">
        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs text-charcoal-muted">
          <div className="flex items-center gap-2 font-semibold text-purple-900 mb-1">
            <BookMarked className="h-4 w-4 text-purple-700" />
            AI Support Assistant
          </div>
          <p className="text-[11px] leading-relaxed text-charcoal-muted">
            Auto-classifies queries into the 6 BookLeaf categories and generates response drafts from company policies. Admins retain full override authority.
          </p>
        </div>
      </div>
    </aside>
  );
}
