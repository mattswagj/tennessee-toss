"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useCart, type CartItem } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

const TAX_RATE = 0.08;
const POINTS_PER_DOLLAR = 1;
const CENTS_PER_POINT = 0.01; // 100 pts = $1

function QuantityButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full border-2 border-primary text-primary font-bold flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-sm"
    >
      {children}
    </button>
  );
}

function CartItemRow({
  entry,
  locale,
  t,
}: {
  entry: CartItem;
  locale: "en" | "es";
  t: ReturnType<typeof useTranslations>;
}) {
  const { updateQuantity, removeItem } = useCart();
  const isCustom = entry.type === "custom";

  const name = isCustom
    ? locale === "es"
      ? entry.baseName_es
      : entry.baseName_en
    : locale === "es"
    ? entry.item.name_es
    : entry.item.name_en;

  const unitPrice = isCustom ? entry.price : entry.item.price;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isCustom && (
            <span className="text-xs font-semibold text-primary uppercase tracking-wide block mb-0.5">
              {t("cart.customSalad")}
            </span>
          )}
          <p className="font-bold text-brown truncate">{name}</p>

          {/* Custom salad details */}
          {isCustom && (
            <div className="mt-1 space-y-0.5">
              {entry.toppings.length > 0 && (
                <p className="text-xs text-gray-400">
                  {entry.toppings
                    .map((tp) => (locale === "es" ? tp.name_es : tp.name_en))
                    .join(", ")}
                </p>
              )}
              {entry.protein && (
                <p className="text-xs text-gray-400">
                  + {locale === "es" ? entry.protein.name_es : entry.protein.name_en}
                </p>
              )}
              {entry.dressing && (
                <p className="text-xs text-gray-400">
                  + {locale === "es" ? entry.dressing.name_es : entry.dressing.name_en}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="font-bold text-brown whitespace-nowrap">
          ${(unitPrice * entry.quantity).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <QuantityButton onClick={() => updateQuantity(entry.cartId, -1)}>
            −
          </QuantityButton>
          <span className="font-semibold text-brown w-6 text-center">
            {entry.quantity}
          </span>
          <QuantityButton onClick={() => updateQuantity(entry.cartId, 1)}>
            +
          </QuantityButton>
        </div>
        <button
          onClick={() => removeItem(entry.cartId)}
          className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
        >
          {t("cart.remove")}
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const t = useTranslations();
  const { locale } = useLanguage();
  const { items, totalPrice } = useCart();
  const { user } = useAuth();

  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [redeemInput, setRedeemInput] = useState("");
  const [appliedPoints, setAppliedPoints] = useState(0);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("loyalty_points")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setLoyaltyBalance(data.loyalty_points ?? 0);
      });
  }, [user]);

  const subtotal = totalPrice;
  const discount = appliedPoints * CENTS_PER_POINT;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;
  const pointsEarned = Math.floor(subtotal * POINTS_PER_DOLLAR);

  const handleApplyPoints = () => {
    const pts = parseInt(redeemInput, 10);
    if (isNaN(pts) || pts <= 0) return;
    if (pts > loyaltyBalance) {
      toast.error(locale === "es" ? "No tienes suficientes puntos" : "Not enough points");
      return;
    }
    const maxRedeemable = Math.floor(subtotal / CENTS_PER_POINT);
    const toApply = Math.min(pts, maxRedeemable);
    setAppliedPoints(toApply);
    toast.success(locale === "es" ? "Puntos aplicados" : "Points applied");
  };

  const handleRemovePoints = () => {
    setAppliedPoints(0);
    setRedeemInput("");
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
        <span className="text-6xl mb-4">🛒</span>
        <h1 className="text-2xl font-bold text-brown mb-2">{t("cart.title")}</h1>
        <p className="text-gray-400 mb-8">{t("cart.empty")}</p>
        <Link
          href="/menu"
          className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          {t("cart.startOrder")}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-brown py-10 px-6 text-center">
        <h1 className="text-3xl font-bold text-white">{t("cart.title")}</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Items */}
        <div className="space-y-3">
          {items.map((entry) => (
            <CartItemRow key={entry.cartId} entry={entry} locale={locale} t={t} />
          ))}
        </div>

        {/* Order type toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-brown mb-3">{t("cart.orderType")}</p>
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {(["pickup", "delivery"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  orderType === type
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 hover:bg-cream"
                }`}
              >
                {t(`cart.${type}`)}
              </button>
            ))}
          </div>
          {orderType === "delivery" && (
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-500 block mb-1">
                {t("cart.deliveryAddress")}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("cart.deliveryPlaceholder")}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
        </div>

        {/* Loyalty points */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-brown mb-3">{t("cart.loyalty.title")}</p>
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t("cart.loyalty.balance")}</span>
                <span className="font-bold text-primary">
                  {loyaltyBalance} {t("cart.loyalty.points")}
                </span>
              </div>

              {appliedPoints > 0 ? (
                <div className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2">
                  <span className="text-sm font-medium text-primary">
                    {t("cart.loyalty.applied")} — {appliedPoints} pts (−${discount.toFixed(2)})
                  </span>
                  <button
                    onClick={handleRemovePoints}
                    className="text-xs text-red-400 hover:text-red-600 font-medium"
                  >
                    {t("cart.loyalty.remove")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={redeemInput}
                    onChange={(e) => setRedeemInput(e.target.value)}
                    placeholder={t("cart.loyalty.redeemPlaceholder")}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    min="1"
                    max={loyaltyBalance}
                  />
                  <button
                    onClick={handleApplyPoints}
                    className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    {t("cart.loyalty.applyBtn")}
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-400">
                {t("cart.loyalty.willEarn", { points: pointsEarned })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {t("cart.loyalty.signIn")}{" "}
              <Link href="/account" className="text-primary font-semibold hover:underline">
                {t("account.signIn")}
              </Link>
            </p>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            <div className="flex justify-between px-5 py-3">
              <span className="text-gray-500 text-sm">{t("cart.subtotal")}</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {appliedPoints > 0 && (
              <div className="flex justify-between px-5 py-3">
                <span className="text-primary text-sm font-medium">Points Discount</span>
                <span className="text-primary font-medium">−${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between px-5 py-3">
              <span className="text-gray-500 text-sm">{t("cart.tax")}</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-5 py-4 bg-cream">
              <span className="font-bold text-brown text-lg">{t("cart.total")}</span>
              <span className="font-bold text-brown text-xl">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout button */}
        <button
          onClick={() => toast.info(locale === "es" ? "¡Pago próximamente!" : "Checkout coming soon!")}
          className="w-full bg-brown hover:bg-brown-hover text-white font-bold py-4 rounded-2xl text-lg transition-colors shadow-sm"
        >
          {t("cart.checkout")}
        </button>
      </div>
    </main>
  );
}
