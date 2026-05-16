"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { AdjustPointsForm } from "@/components/admin/AdjustPointsForm";
import { markRedemptionUsed } from "@/actions/loyalty";
import { toast } from "sonner";
import type { LoyaltyProfile, LoyaltyTransaction, Redemption } from "@/types/loyalty";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_type: string;
  order_items: {
    id: string;
    quantity: number;
    menu_items: { name_en: string; name_es: string } | null;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready:     "bg-green-100 text-green-700",
  delivered: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-primary/10 text-primary",
};

export default function MemberDetailPage() {
  const t   = useTranslations("dashboard");
  const tD  = useTranslations("dashboard.memberDetail");
  const tM  = useTranslations("dashboard.members");
  const { locale } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const params = useParams<{ id: string }>();

  const [profile,      setProfile]      = useState<LoyaltyProfile | null>(null);
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [redemptions,  setRedemptions]  = useState<Redemption[]>([]);
  const [loading,      setLoading]      = useState(true);

  const isAdmin = user && (!ADMIN_EMAIL || user.email === ADMIN_EMAIL);

  useEffect(() => {
    if (!isAdmin || !params.id) return;

    fetch(`/api/admin/members/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { toast.error(data.error); return; }
        setProfile(data.profile);
        setOrders(data.orders ?? []);
        setTransactions(data.transactions ?? []);
        setRedemptions(data.redemptions ?? []);
      })
      .finally(() => setLoading(false));
  }, [isAdmin, params.id]);

  const handleMarkUsed = async (rid: string) => {
    const result = await markRedemptionUsed(rid);
    if (result.error) { toast.error(result.error); return; }
    toast.success(tD("markUsedSuccess"));
    setRedemptions((prev) =>
      prev.map((r) => r.id === rid ? { ...r, status: "used" } : r)
    );
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
      year: "numeric", month: "short", day: "numeric",
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

  const displayName = () => {
    if (!profile) return "";
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
    }
    return profile.full_name ?? profile.email;
  };

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-brown py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/members"
              className="text-white/60 text-sm hover:text-white transition-colors"
            >
              ← {tD("back")}
            </Link>
            <h1 className="text-3xl font-bold text-white mt-1">
              {loading ? "…" : displayName()}
            </h1>
            {profile?.member_number && (
              <p className="font-mono text-white/60 text-sm mt-0.5">{profile.member_number}</p>
            )}
          </div>
          {profile && (
            <div className="text-right">
              <p className="text-4xl font-bold text-white">{profile.current_points.toLocaleString()}</p>
              <p className="text-white/60 text-sm">{tM("currentPoints")}</p>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : profile ? (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Profile info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-brown text-lg mb-3">{tD("title")}</h2>
              <dl className="space-y-2 text-sm">
                {[
                  ["Email", profile.email],
                  [tM("phone"), profile.phone ?? "—"],
                  [tM("signupDate"), fmt(profile.created_at)],
                  [tM("lifetimePoints"), profile.lifetime_points.toLocaleString() + " pts"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-gray-400">{label}</dt>
                    <dd className="font-semibold text-brown text-right">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Adjust points */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-brown text-lg mb-3">{tD("adjustPoints")}</h2>
              <AdjustPointsForm
                userId={profile.id}
                currentPoints={profile.current_points}
                onSuccess={(newPts) =>
                  setProfile((prev) => prev ? { ...prev, current_points: newPts } : prev)
                }
              />
            </div>
          </div>

          {/* Redemptions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-brown text-lg mb-4">{tD("redemptions")}</h2>
            {redemptions.length === 0 ? (
              <p className="text-sm text-gray-400">{tD("noRedemptions")}</p>
            ) : (
              <div className="space-y-3">
                {redemptions.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100"
                  >
                    <div>
                      <p className="font-mono font-bold text-xl text-brown tracking-widest">
                        {r.redemption_code}
                      </p>
                      <p className="text-sm text-gray-600">
                        {locale === "es" ? r.rewards?.name_es : r.rewards?.name_en}
                      </p>
                      <div className="flex gap-3 mt-0.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          r.status === "used" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {r.status}
                        </span>
                        <span className="text-xs text-gray-400">{fmt(r.created_at)}</span>
                        <span className="text-xs text-gray-400">{r.points_cost} pts</span>
                      </div>
                      {r.used_by_admin && (
                        <p className="text-xs text-gray-400 mt-0.5">Used by: {r.used_by_admin}</p>
                      )}
                    </div>
                    {r.status === "pending" && (
                      <button
                        onClick={() => handleMarkUsed(r.id)}
                        className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {tD("markUsed")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points history */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-brown text-lg mb-4">
              {tM("pointsHistory") || "Points History"}
            </h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-400">No transactions.</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs text-gray-400">{fmt(tx.created_at)} · {tx.type}</p>
                      {tx.description && <p className="text-sm text-gray-600">{tx.description}</p>}
                    </div>
                    <span className={`font-bold text-sm ${tx.points > 0 ? "text-primary" : "text-red-500"}`}>
                      {tx.points > 0 ? "+" : ""}{tx.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order history */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-brown text-lg mb-4">
              {tM("orderHistory") || "Order History"}
            </h2>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400">No orders.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">{fmt(order.created_at)}</p>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-0.5 mb-2">
                      {order.order_items.map((oi) => (
                        <p key={oi.id} className="text-sm text-gray-700">
                          {oi.quantity}× {oi.menu_items ? (locale === "es" ? oi.menu_items.name_es : oi.menu_items.name_en) : "Item"}
                        </p>
                      ))}
                    </div>
                    <p className="font-bold text-brown">${order.total_amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
