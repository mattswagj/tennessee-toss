"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { markRedemptionUsed } from "@/actions/loyalty";
import { toast } from "sonner";
import type { Redemption } from "@/types/loyalty";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

export default function RedemptionsPage() {
  const t  = useTranslations("dashboard");
  const tR = useTranslations("dashboard.redemptions");
  const { locale } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && (!ADMIN_EMAIL || user.email === ADMIN_EMAIL);

  const fetchRedemptions = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/redemptions");
    if (res.ok) {
      const data = await res.json();
      setRedemptions(data.redemptions ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchRedemptions();
  }, [isAdmin, fetchRedemptions]);

  const handleMarkUsed = async (rid: string) => {
    const result = await markRedemptionUsed(rid);
    if (result.error) { toast.error(result.error); return; }
    toast.success(tR("markUsed"));
    setRedemptions((prev) => prev.filter((r) => r.id !== rid));
  };

  const displayName = (r: Redemption) => {
    const p = r.profiles;
    if (!p) return "—";
    if (p.first_name || p.last_name) return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
    return p.full_name ?? p.email;
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

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
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{tR("title")}</h1>
            <p className="text-white/60 text-sm mt-1">{redemptions.length} pending</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/members/lookup"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Member Lookup
            </Link>
            <Link
              href="/dashboard/members"
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              ← Members
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : redemptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
            <span className="text-4xl block mb-3">✓</span>
            <p>{tR("noRedemptions")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {redemptions.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-mono text-2xl font-bold text-brown tracking-widest">
                      {r.redemption_code}
                    </p>
                    <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      pending
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {locale === "es" ? r.rewards?.name_es : r.rewards?.name_en}
                  </p>
                  <p className="text-xs text-gray-400">{r.points_cost} pts</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-mono">{r.profiles?.member_number ?? "—"}</span>
                    <span>·</span>
                    <span>{displayName(r)}</span>
                    <span>·</span>
                    <span>{fmt(r.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkUsed(r.id)}
                  className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                >
                  {tR("markUsed")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
