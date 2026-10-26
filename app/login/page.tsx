"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, Eye, EyeOff, Shield, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please verify credentials.");
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/author/dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: demoEmail, password: demoPass }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/author/dashboard");
        }
        router.refresh();
      })
      .catch((err) => {
        setError(err.message || "Failed to sign in demo user");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-800 text-white shadow-md">
            <BookOpen className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-forest-950 editorial-title">
          BookLeaf Publishing
        </h2>
        <p className="mt-1 text-center text-sm text-charcoal-muted">
          Author Support & Operations Communication Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E6E1D8] sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-700 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@email.com or admin@bookleafpublishing.in"
                  className="w-full rounded-lg border border-[#DCD0C0] bg-white pl-10 pr-3.5 py-2 text-sm text-charcoal placeholder-[#8A9992] focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8A9992]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-[#DCD0C0] bg-white pl-10 pr-10 py-2 text-sm text-charcoal placeholder-[#8A9992] focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#8A9992]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#8A9992] hover:text-charcoal"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full py-2.5">
                Sign In to Portal
              </Button>
            </div>
          </form>

          {/* Reviewer Quick Access Section */}
          <div className="mt-8 border-t border-[#E6E1D8] pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                Demo Accounts (Click to Test)
              </span>
              <span className="text-[11px] font-medium text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-100">
                10 Authors Seeded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Priya Sharma */}
              <button
                type="button"
                onClick={() => handleDemoLogin("priya.sharma@email.com", "AuthorPassword123!")}
                className="text-left rounded-xl border border-[#E6E1D8] p-3 hover:border-forest-500 hover:bg-forest-50/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-forest-700" />
                    <span className="text-xs font-semibold text-charcoal">Priya Sharma</span>
                  </div>
                  <span className="text-[10px] text-forest-700 font-mono">AUTH001</span>
                </div>
                <p className="text-[11px] text-charcoal-muted mt-1">2 Published Books • ₹3,570 Pending</p>
                <div className="mt-2 text-[10px] font-semibold text-forest-700 group-hover:underline flex items-center gap-1">
                  Login as Author <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </button>

              {/* Sneha Kulkarni */}
              <button
                type="button"
                onClick={() => handleDemoLogin("sneha.kulkarni@email.com", "AuthorPassword123!")}
                className="text-left rounded-xl border border-[#E6E1D8] p-3 hover:border-forest-500 hover:bg-forest-50/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-forest-700" />
                    <span className="text-xs font-semibold text-charcoal">Sneha Kulkarni</span>
                  </div>
                  <span className="text-[10px] text-forest-700 font-mono">AUTH007</span>
                </div>
                <p className="text-[11px] text-charcoal-muted mt-1">3 Books (1 In Production: Cover)</p>
                <div className="mt-2 text-[10px] font-semibold text-forest-700 group-hover:underline flex items-center gap-1">
                  Login as Author <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </button>

              {/* Ananya Reddy */}
              <button
                type="button"
                onClick={() => handleDemoLogin("ananya.reddy@email.com", "AuthorPassword123!")}
                className="text-left rounded-xl border border-[#E6E1D8] p-3 hover:border-forest-500 hover:bg-forest-50/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-forest-700" />
                    <span className="text-xs font-semibold text-charcoal">Ananya Reddy</span>
                  </div>
                  <span className="text-[10px] text-forest-700 font-mono">AUTH003</span>
                </div>
                <p className="text-[11px] text-charcoal-muted mt-1">1 Book • Zero Payouts • ₹2,546 Pending</p>
                <div className="mt-2 text-[10px] font-semibold text-forest-700 group-hover:underline flex items-center gap-1">
                  Login as Author <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </button>

              {/* BookLeaf Ops Admin */}
              <button
                type="button"
                onClick={() => handleDemoLogin("admin@bookleafpublishing.in", "AdminPassword123!")}
                className="text-left rounded-xl border border-purple-200 bg-purple-50/40 p-3 hover:border-purple-500 hover:bg-purple-100/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-700" />
                    <span className="text-xs font-semibold text-purple-900">BookLeaf Operations</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-200 px-1.5 py-0.5 rounded">ADMIN</span>
                </div>
                <p className="text-[11px] text-purple-700 mt-1">AI Classification • Queue • Approvals</p>
                <div className="mt-2 text-[10px] font-semibold text-purple-800 group-hover:underline flex items-center gap-1">
                  Login as Admin <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
