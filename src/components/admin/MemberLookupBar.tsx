"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { markRedemptionUsed } from "@/actions/loyalty";
import { toast } from "sonner";

interface LookupProfile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  member_number: string | null;
  current_points: number;
  lifetime_points: number;
}

interface LookupRedemption {
  id: string;
  redemption_code: string;
  points_cost: number;
  created_at: string;
  rewards: { name_en: string; name_es: string } | null;
}

interface QuickAddProps {
  userId: string;
  onSuccess: () => void;
}

function QuickAddPoints({ userId, onSuccess }: QuickAddProps) {
  const t = useTranslations("dashboard.lookup");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    const { adjustPoints } = await import("@/actions/loyalty");
    const result = await adjustPoints(userId, 100, "Quick add via lookup");
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("+100 pts added");
      onSuccess();
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
    >
      {loading ? "…" : t("quickAdd100")}
    </button>
  );
}

export function MemberLookupBar() {
  const t = useTranslations("dashboard.lookup");
  const { locale } = useLanguage();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<LookupProfile | null>(null);
  const [redemptions, setRedemptions] = useState<LookupRedemption[]>([]);
  const [searched, setSearched] = useState(false);

  const doLookup = useCallback(async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);

    const res = await fetch("/api/admin/redemptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query.trim() }),
    });

    const data = await res.json();
    setMember(data.member ?? null);
    setRedemptions(data.redemptions ?? []);
    setLoading(false);
  }, [query]);

  const handleMarkUsed = async (id: string) => {
    const result = await markRedemptionUsed(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("markUsedSuccess"));
    setRedemptions((prev) => prev.filter((r) => r.id !== id));
  };

  const displayName = (m: LookupProfile) => {
    if (m.first_name || m.last_name) return `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim();
    return m.full_name ?? m.email;
  };

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doLookup()}
          placeholder={t("placeholder")}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={doLookup}
          disabled={loading}
          className="bg-brown hover:bg-brown-hover text-white font-semibold px-5 py-3 rounded-xl transition-colors"
        >
          {loading ? "…" : "🔍"}
        </button>
      </div>

      {/* Result */}
      {searched && !loading && !member && (
        <div className="bg-white rounded-2xl p-6 text-center text-gray-400 shadow-sm">
          {t("notFound")}
        </div>
      )}

      {member && (
        <div className="space-y-4">
          {/* Member summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-brown text-xl">{displayName(member)}</p>
                <p className="text-sm text-gray-400">{member.email}</p>
                {member.phone && <p className="text-sm text-gray-400">{member.phone}</p>}
                <p className="font-mono text-xs text-gray-400 mt-1">{member.member_number}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{member.current_points.toLocaleString()}</p>
                <p className="text-xs text-gray-400">pts</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <QuickAddPoints
                userId={member.id}
                onSuccess={() => {
                  setMember((prev) => prev ? { ...prev, current_points: prev.current_points + 100 } : null);
                }}
              />
            </div>
          </div>

          {/* Pending redemptions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-brown mb-3">{t("pendingRedemptions")}</h3>
            {redemptions.length === 0 ? (
              <p className="text-sm text-gray-400">{t("noPending")}</p>
            ) : (
              <div className="space-y-3">
                {redemptions.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-cream"
                  >
                    <div>
                      <p className="font-bold font-mono text-xl text-brown tracking-widest">
                        {r.redemption_code}
                      </p>
                      <p className="text-sm text-gray-600">
                        {locale === "es" ? r.rewards?.name_es : r.rewards?.name_en}
                      </p>
                      <p className="text-xs text-gray-400">{r.points_cost} pts</p>
                    </div>
                    <button
                      onClick={() => handleMarkUsed(r.id)}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {t("markUsed")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
