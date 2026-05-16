"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
const REFRESH_INTERVAL = 30_000;

// ── Types ─────────────────────────────────────────────────────

interface Stats {
  ordersToday: number;
  revenueToday: number;
  totalCustomers: number;
  pendingOrders: number;
}

interface LiveOrder {
  id: string;
  created_at: string;
  status: string;
  order_type: string;
  total_amount: number;
  loyalty_points_earned: number;
  notes: string | null;
  profiles: { full_name: string | null; email: string } | null;
  order_items: {
    id: string;
    quantity: number;
    notes: string | null;
    menu_items: { name_en: string; name_es: string } | null;
  }[];
}

// ── Status helpers ────────────────────────────────────────────

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof STATUS_OPTIONS)[number];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  preparing: "bg-orange-100 text-orange-700 border-orange-200",
  ready:     "bg-green-100 text-green-700 border-green-200",
  completed: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

// ── Stat card ─────────────────────────────────────────────────

function StatCard({
  label,
  value,
  prefix,
}: {
  label: string;
  value: number;
  prefix?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-brown">
        {prefix}
        {typeof value === "number" && prefix === "$"
          ? value.toFixed(2)
          : value}
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("dashboard.status");
  const { locale } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<Stats>({
    ordersToday: 0,
    revenueToday: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const isAdmin =
    user && (user.email === ADMIN_EMAIL || ADMIN_EMAIL === "");

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStr = todayStart.toISOString();

    const [ordersToday, revenueData, customers, pending, liveOrders] =
      await Promise.all([
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .gte("created_at", todayStr),
        supabase
          .from("orders")
          .select("total_amount")
          .gte("created_at", todayStr)
          .neq("status", "cancelled"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("orders")
          .select(
            `id, created_at, status, order_type, total_amount, loyalty_points_earned, notes,
             profiles(full_name, email),
             order_items(id, quantity, notes, menu_items(name_en, name_es))`
          )
          .in("status", ["pending", "confirmed", "preparing", "ready"])
          .order("created_at", { ascending: false }),
      ]);

    const revenue = (revenueData.data ?? []).reduce(
      (sum, o) => sum + (o.total_amount ?? 0),
      0
    );

    setStats({
      ordersToday: ordersToday.count ?? 0,
      revenueToday: revenue,
      totalCustomers: customers.count ?? 0,
      pendingOrders: pending.count ?? 0,
    });

    if (liveOrders.data) setOrders(liveOrders.data as unknown as LiveOrder[]);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [isAdmin, fetchData]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    setOrders((prev) =>
      prev
        .map((o) => (o.id === orderId ? { ...o, status } : o))
        .filter((o) => !["delivered", "cancelled"].includes(o.status))
    );
    toast.success("Status updated");
  };

  // ── Auth / loading guards ─────────────────────────────────

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
      <div className="bg-brown py-10 px-6 text-center">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-white/60 text-xs mt-2">
          {t("autoRefresh")} —{" "}
          {locale === "es"
            ? `Última actualización: ${lastRefresh.toLocaleTimeString("es-MX")}`
            : `Last refresh: ${lastRefresh.toLocaleTimeString()}`}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t("stats.ordersToday")} value={stats.ordersToday} />
          <StatCard label={t("stats.revenueToday")} value={stats.revenueToday} prefix="$" />
          <StatCard label={t("stats.customers")} value={stats.totalCustomers} />
          <StatCard label={t("stats.pending")} value={stats.pendingOrders} />
        </div>

        {/* Live orders */}
        <div>
          <h2 className="text-2xl font-bold text-brown mb-4">{t("orders.title")}</h2>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
              <span className="text-4xl block mb-3">📋</span>
              <p>{t("orders.empty")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const customer =
                  order.profiles?.full_name ??
                  order.profiles?.email ??
                  "Guest";

                const timeAgo = new Date(order.created_at).toLocaleTimeString(
                  locale === "es" ? "es-MX" : "en-US",
                  { hour: "2-digit", minute: "2-digit" }
                );

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 shadow-sm"
                  >
                    {/* Top row */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="font-bold text-brown text-lg">{customer}</p>
                        <p className="text-xs text-gray-400">
                          {timeAgo} ·{" "}
                          <span className="capitalize">
                            {order.order_type === "dine_in"
                              ? "Dine In"
                              : order.order_type === "delivery"
                              ? t("orders.delivery")
                              : t("orders.pickup")}
                          </span>
                        </p>
                      </div>

                      {/* Status dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value as OrderStatus)
                        }
                        className={`border rounded-xl px-3 py-1.5 text-sm font-semibold outline-none cursor-pointer ${
                          STATUS_COLORS[order.status as OrderStatus] ??
                          STATUS_COLORS.pending
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {tStatus(s)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-4">
                      {order.order_items.map((oi) => (
                        <div key={oi.id} className="flex items-center gap-2">
                          <span className="text-xs bg-cream text-brown font-semibold px-2 py-0.5 rounded-full">
                            ×{oi.quantity}
                          </span>
                          <span className="text-sm text-gray-700">
                            {oi.menu_items
                              ? locale === "es"
                                ? oi.menu_items.name_es
                                : oi.menu_items.name_en
                              : "Custom item"}
                          </span>
                          {oi.notes && (
                            <span className="text-xs text-gray-400 italic">
                              — {oi.notes}
                            </span>
                          )}
                        </div>
                      ))}
                      {order.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">
                          Note: {order.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                      <div className="flex gap-4">
                        <span className="text-sm font-bold text-brown">
                          ${order.total_amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400">
                          +{order.loyalty_points_earned} pts
                        </span>
                      </div>
                      <span className="text-xs text-gray-300 font-mono">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
