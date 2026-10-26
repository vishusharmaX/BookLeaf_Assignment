"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, UserCheck, Shield, LogOut, ChevronDown, RefreshCw } from "lucide-react";

interface NavbarUser {
  userId?: string;
  id?: string;
  name: string;
  email: string;
  role: "AUTHOR" | "ADMIN";
  authorId?: string;
}

interface NavbarProps {
  user: NavbarUser;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const handleQuickSwitch = async (email: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: email.includes("admin") ? "AdminPassword123!" : "AuthorPassword123!",
        }),
      });
      if (res.ok) {
        setDropdownOpen(false);
        const data = await res.json();
        if (data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/author/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Quick switch error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E6E1D8] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href={user.role === "ADMIN" ? "/admin/dashboard" : "/author/dashboard"}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-800 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="editorial-title text-lg font-bold tracking-tight text-forest-900 block leading-tight">
                BookLeaf Publishing
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-forest-600 block">
                {user.role === "ADMIN" ? "Operations & Support Desk" : "Author Support Portal"}
              </span>
            </div>
          </Link>
        </div>

        {/* Right side navigation & profile */}
        <div className="flex items-center gap-4">
          {/* Role badge */}
          <span
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
              user.role === "ADMIN"
                ? "bg-purple-100 text-purple-800 border border-purple-200"
                : "bg-forest-100 text-forest-800 border border-forest-200"
            }`}
          >
            {user.role === "ADMIN" ? (
              <>
                <Shield className="h-3 w-3" /> BookLeaf Operations Staff
              </>
            ) : (
              <>
                <UserCheck className="h-3 w-3" /> Verified Author
              </>
            )}
          </span>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-lg border border-[#E6E1D8] bg-ivory-50 px-3 py-1.5 text-left text-sm text-charcoal hover:bg-ivory-100 focus:outline-none transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-xs font-semibold text-white">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium leading-none text-charcoal">{user.name}</p>
                <p className="text-[11px] text-charcoal-muted leading-tight mt-0.5">{user.email}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-charcoal-muted" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-[#E6E1D8] bg-white py-2 shadow-xl ring-1 ring-black/5 z-50">
                <div className="border-b border-[#F4EFE7] px-4 py-2.5">
                  <p className="text-xs font-medium text-charcoal">{user.name}</p>
                  <p className="text-xs text-charcoal-muted">{user.email}</p>
                  <div className="mt-1.5">
                    <span className="inline-block rounded bg-forest-50 px-1.5 py-0.5 text-[10px] font-semibold text-forest-700">
                      Role: {user.role}
                    </span>
                  </div>
                </div>

                {/* Quick Role Switcher for reviewers */}
                <div className="border-b border-[#F4EFE7] px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted mb-1.5 flex items-center gap-1">
                    <RefreshCw className="h-2.5 w-2.5" /> Quick Reviewer Switch
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleQuickSwitch("priya.sharma@email.com")}
                      className="w-full text-left px-2 py-1 rounded text-xs text-charcoal hover:bg-ivory-100 transition-colors flex items-center justify-between"
                    >
                      <span>Priya Sharma (Author)</span>
                      <span className="text-[10px] text-forest-600">AUTH001</span>
                    </button>
                    <button
                      onClick={() => handleQuickSwitch("sneha.kulkarni@email.com")}
                      className="w-full text-left px-2 py-1 rounded text-xs text-charcoal hover:bg-ivory-100 transition-colors flex items-center justify-between"
                    >
                      <span>Sneha Kulkarni (Author)</span>
                      <span className="text-[10px] text-forest-600">AUTH007</span>
                    </button>
                    <button
                      onClick={() => handleQuickSwitch("admin@bookleafpublishing.in")}
                      className="w-full text-left px-2 py-1 rounded text-xs text-purple-700 hover:bg-purple-50 transition-colors flex items-center justify-between"
                    >
                      <span>BookLeaf Ops (Admin)</span>
                      <span className="text-[10px] text-purple-600">ADMIN</span>
                    </button>
                  </div>
                </div>

                <div className="px-2 pt-1.5">
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
