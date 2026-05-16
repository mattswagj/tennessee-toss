"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { AdminMembersTable } from "@/components/admin/AdminMembersTable";
import type { AdminMember } from "@/types/loyalty";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

type SortKey = "created_at" | "current_points" | "lifetime_points";

export default function MembersPage() {
  const t = useTranslations("dashboard");
  const tM = useTranslations("dashboard.members");
  const { user, loading: authLoading } = useAuth();

  const [members, setMembers]   = useState<AdminMember[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState<SortKey>("created_at");
  const [dir, setDir]           = useState<"asc" | "desc">("desc");
  const [loading, setLoading]   = useState(true);

  const isAdmin = user && (!ADMIN_EMAIL || user.email === ADMIN_EMAIL);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      sort,
      dir,
    });
    if (search.trim()) params.set("search", search.trim());

    const res = await fetch(`/api/admin/members?${params}`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
      setTotal(data.total ?? 0);
    }
    setLoading(false);
  }, [page, search, sort, dir]);

  useEffect(() => {
    if (isAdmin) fetchMembers();
  }, [isAdmin, fetchMembers]);

  const handleSort = (key: SortKey) => {
    if (sort === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir("desc");
    }
    setPage(0);
  };

  // ── Auth guards ───────────────────────────────────────────────

  if (authLoading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-4">
        <span className="text-6xl mb-4">🔒</span>
        <h1 className="text-2xl font-bold text-brown mb-2">{t("unauthorized")}</h1>
        <p className="text-gray-500">{t("unauthorizedMsg")}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-brown py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{tM("title")}</h1>
            <p className="text-white/60 text-sm mt-1">{total.toLocaleString()} {tM("totalMembers")}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/members/lookup"
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {tM("lookup")}
            </Link>
            <Link
              href="/dashboard/redemptions"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {tM("redemptions")}
            </Link>
            <Link
              href="/dashboard"
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              ← {t("orders.title")}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={tM("search")}
            className="w-full max-w-md border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary bg-white transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <AdminMembersTable
              members={members}
              total={total}
              page={page}
              limit={20}
              sort={sort}
              dir={dir}
              onSort={handleSort}
              onPage={(p) => setPage(p)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
