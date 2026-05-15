"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  loyalty_points: number;
  preferred_language: string;
}

interface Reward {
  id: string;
  name_en: string;
  name_es: string;
  description_en: string | null;
  description_es: string | null;
  points_required: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_type: string;
  order_items: {
    id: string;
    quantity: number;
    menu_item_id: string;
    menu_items: { name_en: string; name_es: string } | null;
  }[];
}

// ── Status badge ──────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  delivered: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}

// ── Auth forms ────────────────────────────────────────────────

function AuthForms({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) toast.error(error.message);
      else toast.success("Account created! Check your email to confirm.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === m
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t(`account.${m === "signin" ? "signIn" : "signUp"}`)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                {t("account.fullName")}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                required={mode === "signup"}
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              {t("account.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              {t("account.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading
              ? t(`account.${mode === "signin" ? "signingIn" : "signingUp"}`)
              : t(`account.${mode === "signin" ? "signIn" : "signUp"}`)}
          </button>
        </form>

        <div className="pb-5 text-center text-xs text-gray-400">
          {mode === "signin" ? (
            <>
              {t("account.noAccount")}{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-primary font-semibold hover:underline"
              >
                {t("account.signUp")}
              </button>
            </>
          ) : (
            <>
              {t("account.haveAccount")}{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-primary font-semibold hover:underline"
              >
                {t("account.signIn")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function AccountPage() {
  const t = useTranslations();
  const { locale, toggleLanguage } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }
    const supabase = createClient();

    Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("rewards").select("*").eq("is_active", true).order("points_required"),
      supabase
        .from("orders")
        .select("*, order_items(id, quantity, menu_item_id, menu_items(name_en, name_es))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]).then(([profileRes, rewardsRes, ordersRes]) => {
      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (rewardsRes.data) setRewards(rewardsRes.data as Reward[]);
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
      setDataLoading(false);
    });
  }, [user]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(locale === "es" ? "Sesión cerrada" : "Signed out");
  };

  const handleSaveLanguage = async () => {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ preferred_language: locale })
      .eq("id", user.id);
    toast.success(locale === "es" ? "Preferencia guardada" : "Language preference saved");
  };

  const handleReorder = async (order: Order) => {
    const supabase = createClient();
    const itemIds = order.order_items
      .map((oi) => oi.menu_item_id)
      .filter(Boolean);
    if (itemIds.length === 0) return;

    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .in("id", itemIds);

    if (data) {
      data.forEach((item) => addItem(item as Parameters<typeof addItem>[0]));
      toast.success(locale === "es" ? "Artículos agregados al carrito" : "Items added to cart!");
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!profile || profile.loyalty_points < reward.points_required) {
      toast.error(locale === "es" ? "No tienes suficientes puntos" : "Not enough points");
      return;
    }
    toast.info(locale === "es" ? "Función próximamente" : "Redemption coming soon!");
  };

  const NEXT_REWARD_THRESHOLD = 500;
  const progressPct = profile
    ? Math.min((profile.loyalty_points % NEXT_REWARD_THRESHOLD) / NEXT_REWARD_THRESHOLD * 100, 100)
    : 0;
  const pointsToNext = profile
    ? NEXT_REWARD_THRESHOLD - (profile.loyalty_points % NEXT_REWARD_THRESHOLD)
    : NEXT_REWARD_THRESHOLD;

  if (authLoading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-brown py-10 px-6 text-center">
        <h1 className="text-3xl font-bold text-white">{t("account.title")}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {!user ? (
          <AuthForms t={t} />
        ) : dataLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Profile header */}
            <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-brown text-lg">
                  {profile?.full_name ?? user.email}
                </p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-400 hover:text-red-600 font-semibold transition-colors whitespace-nowrap"
              >
                {t("account.signOut")}
              </button>
            </div>

            {/* Loyalty points */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-brown text-lg mb-4">
                {t("account.loyalty.title")}
              </h2>
              <div className="flex items-end justify-between mb-3">
                <p className="text-3xl font-bold text-primary">
                  {profile?.loyalty_points ?? 0}
                </p>
                <p className="text-sm text-gray-400">
                  {t("account.loyalty.balance", { points: profile?.loyalty_points ?? 0 })}
                </p>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {t("account.loyalty.progress", { points: pointsToNext })}
              </p>
            </div>

            {/* Available rewards */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-brown text-lg mb-4">
                {t("account.loyalty.rewards")}
              </h2>
              {rewards.length === 0 ? (
                <p className="text-sm text-gray-400">{t("account.loyalty.noRewards")}</p>
              ) : (
                <div className="space-y-3">
                  {rewards.map((r) => {
                    const name = locale === "es" ? r.name_es : r.name_en;
                    const desc = locale === "es" ? r.description_es : r.description_en;
                    const canRedeem = (profile?.loyalty_points ?? 0) >= r.points_required;
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-brown text-sm">{name}</p>
                          {desc && <p className="text-xs text-gray-400">{desc}</p>}
                          <p className="text-xs text-primary font-semibold mt-0.5">
                            {r.points_required} pts
                          </p>
                        </div>
                        <button
                          onClick={() => handleRedeemReward(r)}
                          disabled={!canRedeem}
                          className="bg-primary disabled:opacity-40 hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {t("account.loyalty.redeem")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order history */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-brown text-lg mb-4">
                {t("account.orders.title")}
              </h2>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-400">{t("account.orders.noOrders")}</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-100 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString(
                            locale === "es" ? "es-MX" : "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </p>
                        <StatusBadge
                          status={order.status}
                          label={
                            t(`account.orders.status.${order.status as "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"}`)
                          }
                        />
                      </div>
                      <div className="space-y-0.5 mb-3">
                        {order.order_items.map((oi) => (
                          <p key={oi.id} className="text-sm text-gray-700">
                            {oi.quantity}×{" "}
                            {oi.menu_items
                              ? locale === "es"
                                ? oi.menu_items.name_es
                                : oi.menu_items.name_en
                              : "Item"}
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-brown">
                          ${order.total_amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleReorder(order)}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          {t("account.orders.reorder")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Language preference */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-brown text-lg mb-4">
                {t("account.language.title")}
              </h2>
              <div className="flex gap-3">
                <div className="flex rounded-xl overflow-hidden border border-gray-200 flex-1">
                  {(["en", "es"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => locale !== l && toggleLanguage()}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                        locale === l
                          ? "bg-primary text-white"
                          : "text-gray-500 hover:bg-cream"
                      }`}
                    >
                      {l === "en" ? "English" : "Español"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSaveLanguage}
                  className="bg-brown hover:bg-brown-hover text-white text-sm font-semibold px-4 rounded-xl transition-colors"
                >
                  {t("account.language.save")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
