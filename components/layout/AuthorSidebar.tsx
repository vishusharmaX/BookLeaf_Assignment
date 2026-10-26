"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookMarked,
  MessageSquare,
  PlusCircle,
  HelpCircle,
  FileText,
} from "lucide-react";

export function AuthorSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/author/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/author/dashboard",
    },
    {
      name: "My Books",
      href: "/author/books",
      icon: BookMarked,
      active: pathname.startsWith("/author/books"),
    },
    {
      name: "Support Tickets",
      href: "/author/tickets",
      icon: MessageSquare,
      active: pathname === "/author/tickets" || (pathname.startsWith("/author/tickets/") && pathname !== "/author/tickets/new"),
    },
    {
      name: "Submit Query",
      href: "/author/tickets/new",
      icon: PlusCircle,
      active: pathname === "/author/tickets/new",
      highlight: true,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-[#E6E1D8] bg-white hidden md:block min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted mb-2">
          Author Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                item.active
                  ? "bg-forest-800 text-white shadow-sm"
                  : item.highlight
                  ? "text-forest-700 bg-forest-50 hover:bg-forest-100"
                  : "text-charcoal hover:bg-ivory-100 hover:text-forest-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${item.active ? "text-white" : "text-forest-700"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 border-t border-[#F4EFE7] pt-4">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted mb-2">
          Knowledge Base Summary
        </p>
        <div className="rounded-xl border border-forest-100 bg-forest-50/50 p-3 text-xs text-charcoal-muted space-y-2">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-forest-700 shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-forest-900">80/20 Royalty Split:</span> Net profit payouts quarterly within 45 days. Minimum ₹1,000 threshold.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-forest-700 shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-forest-900">Support SLA:</span> Tickets answered promptly by BookLeaf operations desk.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
