"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase";
import { redeemReward } from "@/actions/loyalty";
import { MemberCard } from "@/components/loyalty/MemberCard";
import { PointsBalance } from "@/components/loyalty/PointsBalance";
import { RewardTierProgress } from "@/components/loyalty/RewardTierProgress";
import { TransactionList } from "@/components/loyalty/TransactionList";
import { RedemptionCode } from "@/components/loyalty/RedemptionCode";
import { toast } from "sonner";
import type { LoyaltyProfile, LoyaltyTransaction, Redemption, LoyaltyReward } from "@/types/loyalty";

// ── Types ─────────────────────────────────────────────────────

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

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready:     "bg-green-100 text-green-700",
  delivered: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-primary/10 text-primary",
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

// ── Phone validation (E.164, US default) ─────────────────────

const PHONE_RE = /^\+1[2-9]\d{9}$|^\+[1-9]\d{7,14}$/;

function normalizePhone(raw: string): string {
  const stripped = raw.replace(/\D/g, "");
  if (stripped.length === 10) return `+1${stripped}`;
  if (stripped.length === 11 && stripped.startsWith("1")) return `+${stripped}`;
  return raw.startsWith("+") ? raw : `+${stripped}`;
}

// ── Auth forms ────────────────────────────────────────────────

function AuthForms({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [phoneErr,  setPhoneErr]  = useState("");
  const [loading,   setLoading]   = useState(false);

  const validatePhone = (raw: string) => {
    if (!raw) return t("account.phoneRequired");
    const normalized = normalizePhone(raw);
    if (!PHONE_RE.test(normalized)) return t("account.phoneInvalid");
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    if (mode === "signin") {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      setLoading(false);
      return;
    }

    // Signup validation
    const pErr = validatePhone(phone);
    if (pErr) { setPhoneErr(pErr); return; }
    setPhoneErr("");

    setLoading(true);
    const normalized = normalizePhone(phone);
    const fullName = `${firstName} ${lastName}`.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Upsert profile with extra fields
    if (data.user) {
      await supabase.from("profiles").upsert({
        id:         data.user.id,
        email:      data.user.email ?? email,
        full_name:  fullName,
        first_name: firstName,
        last_name:  lastName,
        phone:      normalized,
      });
    }

    toast.success(t("account.signupSuccess"));
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
                mode === m ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t(`account.${m === "signin" ? "signIn" : "signUp"}`)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "signup" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-first-name" className="text-xs font-medium text-gray-500 block mb-1">
                    {t("account.firstName")}
                  </label>
                  <input
                    id="signup-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-last-name" className="text-xs font-medium text-gray-500 block mb-1">
                    {t("account.lastName")}
                  </label>
                  <input
                    id="signup-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="signup-phone" className="text-xs font-medium text-gray-500 block mb-1">
                  {t("account.phone")}
                  <span className="text-gray-300 font-normal ml-1">{t("account.phoneHint")}</span>
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneErr(""); }}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors ${
                    phoneErr ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-primary"
                  }`}
                  required
                />
                {phoneErr && <p className="text-xs text-red-500 mt-1">{phoneErr}</p>}
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="text-xs font-medium text-gray-500 block mb-1">{t("account.email")}</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="text-xs font-medium text-gray-500 block mb-1">{t("account.password")}</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary transition-colors"
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
              <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">
                {t("account.signUp")}
              </button>
            </>
          ) : (
            <>
              {t("account.haveAccount")}{" "}
              <button onClick={() => setMode("signin")} className="text-primary font-semibold hover:underline">
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

  const [profile,       setProfile]       = useState<LoyaltyProfile | null>(null);
  const [rewards,       setRewards]       = useState<LoyaltyReward[]>([]);
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [transactions,  setTransactions]  = useState<LoyaltyTransaction[]>([]);
  const [redemptions,   setRedemptions]   = useState<Redemption[]>([]);
  const [dataLoading,   setDataLoading]   = useState(true);
  const [activeCode,    setActiveCode]    = useState<string | null>(null);
  const [redeemingId,   setRedeemingId]   = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) { setDataLoading(false); return; }
    const supabase = createClient();

    const [profileRes, rewardsRes, ordersRes, txRes, redemptionsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("rewards").select("*").eq("is_active", true).order("points_required"),
      supabase
        .from("orders")
        .select("*, order_items(id, quantity, menu_item_id, menu_items(name_en, name_es))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("redemptions")
        .select("*, rewards(name_en, name_es, points_required)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data as LoyaltyProfile);
    if (rewardsRes.data) setRewards(rewardsRes.data as LoyaltyReward[]);
    if (ordersRes.data)  setOrders(ordersRes.data as Order[]);
    if (txRes.data)      setTransactions(txRes.data as LoyaltyTransaction[]);
    if (redemptionsRes.data) setRedemptions(redemptionsRes.data as Redemption[]);
    setDataLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(locale === "es" ? "Sesión cerrada" : "Signed out");
  };

  const handleSaveLanguage = async () => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ preferred_language: locale }).eq("id", user.id);
    toast.success(locale === "es" ? "Preferencia guardada" : "Language preference saved");
  };

  const handleReorder = async (order: Order) => {
    const supabase = createClient();
    const itemIds = order.order_items.map((oi) => oi.menu_item_id).filter(Boolean);
    if (!itemIds.length) return;
    const { data } = await supabase.from("menu_items").select("*").in("id", itemIds);
    if (data) {
      data.forEach((item) => addItem(item as Parameters<typeof addItem>[0]));
      toast.success(locale === "es" ? "Artículos agregados al carrito" : "Items added to cart!");
    }
  };

  const handleRedeem = async (reward: LoyaltyReward) => {
    if (!profile || profile.current_points < reward.points_required) {
      toast.error(t("account.loyalty.notEnoughPoints"));
      return;
    }
    setRedeemingId(reward.id);
    const result = await redeemReward(reward.id);
    setRedeemingId(null);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    setActiveCode(result.code);
    // Optimistically update points
    setProfile((prev) =>
      prev ? { ...prev, current_points: prev.current_points - reward.points_required } : prev
    );
    await fetchData();
  };

  // This-month points
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonthPoints = transactions
    .filter((tx) => tx.points > 0 && new Date(tx.created_at) >= monthStart)
    .reduce((sum, tx) => sum + tx.points, 0);

  const pendingRedemptions = redemptions.filter((r) => r.status === "pending");

  if (authLoading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      {activeCode && (
        <RedemptionCode
          code={activeCode}
          onClose={() => setActiveCode(null)}
        />
      )}

      <div className="bg-brown py-10 px-6 text-center">
        <h1 className="text-3xl font-bold text-white">{t("account.title")}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {!user ? (
          <AuthForms t={t} />
        ) : dataLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Profile header */}
            <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-brown text-lg">
                  {profile
                    ? (profile.first_name || profile.last_name
                        ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
                        : profile.full_name ?? user.email)
                    : user.email}
                </p>
                <p className="text-sm text-gray-400">{user.email}</p>
                {profile?.phone && <p className="text-xs text-gray-400">{profile.phone}</p>}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-400 hover:text-red-600 font-semibold transition-colors whitespace-nowrap"
              >
                {t("account.signOut")}
              </button>
            </div>

            {/* Member card */}
            <MemberCard
              memberNumber={profile?.member_number ?? null}
              name={
                profile
                  ? (profile.first_name || profile.last_name
                      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
                      : profile.full_name ?? null)
                  : null
              }
            />

            {/* Points balance */}
            <PointsBalance
              current={profile?.current_points ?? 0}
              thisMonth={thisMonthPoints}
              lifetime={profile?.lifetime_points ?? 0}
            />

            {/* Reward tiers */}
            <RewardTierProgress currentPoints={profile?.current_points ?? 0} />

            {/* Available rewards */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-brown text-lg mb-4">{t("account.loyalty.rewards")}</h2>
              {rewards.length === 0 ? (
                <p className="text-sm text-gray-400">{t("account.loyalty.noRewards")}</p>
              ) : (
                <div className="space-y-3">
                  {rewards.map((r) => {
                    const name = locale === "es" ? r.name_es : r.name_en;
                    const desc = locale === "es" ? r.description_es : r.description_en;
                    const canRedeem = (profile?.current_points ?? 0) >= r.points_required;
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-brown text-sm">{name}</p>
                          {desc && <p className="text-xs text-gray-400">{desc}</p>}
                          <p className="text-xs text-primary font-semibold mt-0.5">
                            {r.points_required.toLocaleString()} pts
                          </p>
                        </div>
                        <button
                          onClick={() => handleRedeem(r)}
                          disabled={!canRedeem || redeemingId === r.id}
                          className="bg-primary disabled:opacity-40 hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {redeemingId === r.id ? "…" : t("account.loyalty.redeem")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending redemptions */}
            {pendingRedemptions.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-brown text-lg mb-4">
                  {t("account.loyalty.pendingRedemptions")}
                </h2>
                <div className="space-y-3">
                  {pendingRedemptions.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-cream"
                    >
                      <div>
                        <p className="font-mono font-bold text-xl text-brown tracking-widest">
                          {r.redemption_code}
                        </p>
                        <p className="text-sm text-gray-600">
                          {locale === "es" ? r.rewards?.name_es : r.rewards?.name_en}
                        </p>
                        <p className="text-xs text-gray-400">{r.points_cost} pts</p>
                      </div>
                      <button
                        onClick={() => setActiveCode(r.redemption_code)}
                        className="bg-brown hover:bg-brown-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {t("account.loyalty.showCode")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction history */}
            <TransactionList transactions={transactions} />

            {/* Order history */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-brown text-lg mb-4">{t("account.orders.title")}</h2>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-400">{t("account.orders.noOrders")}</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString(
                            locale === "es" ? "es-MX" : "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </p>
                        <StatusBadge
                          status={order.status}
                          label={t(`account.orders.status.${order.status as "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"}`) ?? order.status}
                        />
                      </div>
                      <div className="space-y-0.5 mb-3">
                        {order.order_items.map((oi) => (
                          <p key={oi.id} className="text-sm text-gray-700">
                            {oi.quantity}×{" "}
                            {oi.menu_items
                              ? locale === "es" ? oi.menu_items.name_es : oi.menu_items.name_en
                              : "Item"}
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-brown">${order.total_amount.toFixed(2)}</p>
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
              <h2 className="font-bold text-brown text-lg mb-4">{t("account.language.title")}</h2>
              <div className="flex gap-3">
                <div className="flex rounded-xl overflow-hidden border border-gray-200 flex-1">
                  {(["en", "es"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => locale !== l && toggleLanguage()}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                        locale === l ? "bg-primary text-white" : "text-gray-500 hover:bg-cream"
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
