"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { createClient, type MenuItem } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ── Progress bar ──────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-500"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  );
}

// ── Selection card ────────────────────────────────────────────

function SelectCard({
  selected,
  disabled = false,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all ${
        disabled
          ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
          : selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-gray-200 bg-white hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function BuildPage() {
  const t = useTranslations("builder");
  const { locale } = useLanguage();
  const { addCustomSalad } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedBase, setSelectedBase] = useState<MenuItem | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<MenuItem[]>([]);
  const [selectedProtein, setSelectedProtein] = useState<MenuItem | null>(null);
  const [selectedDressing, setSelectedDressing] = useState<MenuItem | null>(null);

  const [bases, setBases] = useState<MenuItem[]>([]);
  const [toppings, setToppings] = useState<MenuItem[]>([]);
  const [proteins, setProteins] = useState<MenuItem[]>([]);
  const [dressings, setDressings] = useState<MenuItem[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  const TOTAL_STEPS = 5;

  useEffect(() => {
    const supabase = createClient();
    const bySlug = (slug: string) =>
      supabase
        .from("menu_items")
        .select("*, menu_categories!inner(slug)")
        .eq("menu_categories.slug", slug)
        .order("display_order");

    Promise.all([
      bySlug("base"),
      bySlug("toppings"),
      bySlug("protein"),
      bySlug("dressing"),
    ]).then(([bRes, tRes, pRes, dRes]) => {
      if (bRes.data) setBases(bRes.data as MenuItem[]);
      if (tRes.data) setToppings(tRes.data as MenuItem[]);
      if (pRes.data) setProteins(pRes.data as MenuItem[]);
      if (dRes.data) setDressings(dRes.data as MenuItem[]);
      setDbLoading(false);
    });
  }, []);

  const name = (item: { name_en: string; name_es: string }) =>
    locale === "es" ? item.name_es : item.name_en;
  const desc = (item: { description_en: string | null; description_es: string | null }) =>
    locale === "es" ? item.description_es : item.description_en;

  const isUnavailable = (item: MenuItem) => item.coming_soon || !item.is_available;

  const toggleTopping = (item: MenuItem) => {
    setSelectedToppings((prev) =>
      prev.some((x) => x.id === item.id)
        ? prev.filter((x) => x.id !== item.id)
        : [...prev, item]
    );
  };

  const canGoNext = () => {
    if (step === 1) return selectedBase !== null;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleAddToCart = () => {
    if (!selectedBase) return;

    addCustomSalad({
      base: selectedBase.id,
      baseName_en: selectedBase.name_en,
      baseName_es: selectedBase.name_es,
      toppings: selectedToppings.map((tp) => ({
        id: tp.id,
        name_en: tp.name_en,
        name_es: tp.name_es,
      })),
      protein: selectedProtein,
      dressing: selectedDressing,
      // Prices are TBD (all $0 for now) — sum what we have.
      price:
        (selectedBase.price ?? 0) +
        selectedToppings.reduce((sum, tp) => sum + (tp.price ?? 0), 0) +
        (selectedProtein?.price ?? 0) +
        (selectedDressing?.price ?? 0),
    });

    toast.success(
      locale === "es" ? "¡Ensalada agregada al carrito!" : "Custom salad added to cart!"
    );
    router.push("/cart");
  };

  const stepLabel = (n: number) =>
    ({
      1: t("step1Label"),
      2: t("step2Label"),
      3: t("step3Label"),
      4: t("step4Label"),
      5: t("step5Label"),
    }[n] ?? "");

  const stepSub = (n: number) =>
    ({
      1: t("step1Sub"),
      2: t("step2Sub"),
      3: t("step3Sub"),
      4: t("step4Sub"),
    }[n] ?? "");

  const LoadingCards = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-brown py-12 px-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">{t("title")}</h1>
        <p className="text-white/70">{t("subtitle")}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-brown">
              {t("stepOf", { current: step, total: TOTAL_STEPS })}
            </span>
            <span className="text-sm font-semibold text-primary">{stepLabel(step)}</span>
          </div>
          <ProgressBar step={step} total={TOTAL_STEPS} />
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  n < step
                    ? "bg-primary text-white"
                    : n === step
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {n < step ? "✓" : n}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 1: Base (pick one) ─────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-1">{t("step1Label")}</h2>
            <p className="text-sm text-gray-500 mb-6">{stepSub(1)}</p>
            {dbLoading ? (
              <LoadingCards />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {bases.map((base) => (
                  <SelectCard
                    key={base.id}
                    selected={selectedBase?.id === base.id}
                    onClick={() => setSelectedBase(base)}
                  >
                    <div className="font-bold text-brown">{name(base)}</div>
                    {desc(base) && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{desc(base)}</div>
                    )}
                  </SelectCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Toppings (pick many) ────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-1">{t("step2Label")}</h2>
            <p className="text-sm text-gray-500 mb-6">{stepSub(2)}</p>
            {dbLoading ? (
              <LoadingCards />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {toppings.map((topping) => {
                  const active = selectedToppings.some((x) => x.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      onClick={() => toggleTopping(topping)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 bg-white hover:border-primary/40"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                          active ? "bg-primary border-primary" : "border-gray-300"
                        }`}
                      >
                        {active && (
                          <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-brown">{name(topping)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Protein (pick one, coming-soon disabled) ─ */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-1">{t("step3Label")}</h2>
            <p className="text-sm text-gray-500 mb-6">{stepSub(3)}</p>
            {dbLoading ? (
              <LoadingCards />
            ) : (
              <div className="space-y-3">
                <SelectCard
                  selected={selectedProtein === null}
                  onClick={() => setSelectedProtein(null)}
                >
                  <span className="font-medium text-gray-500">{t("noProtein")}</span>
                </SelectCard>
                {proteins.map((p) => {
                  const unavailable = isUnavailable(p);
                  return (
                    <SelectCard
                      key={p.id}
                      selected={selectedProtein?.id === p.id}
                      disabled={unavailable}
                      onClick={() => !unavailable && setSelectedProtein(p)}
                    >
                      {unavailable && (
                        <span className="absolute top-3 right-3 bg-primary text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {t("comingSoon")}
                        </span>
                      )}
                      <span className="font-bold text-brown">{name(p)}</span>
                      {desc(p) && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 pr-20">{desc(p)}</p>
                      )}
                    </SelectCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Dressing (pick one) ─────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-1">{t("step4Label")}</h2>
            <p className="text-sm text-gray-500 mb-6">{stepSub(4)}</p>
            {dbLoading ? (
              <LoadingCards />
            ) : (
              <div className="space-y-3">
                <SelectCard
                  selected={selectedDressing === null}
                  onClick={() => setSelectedDressing(null)}
                >
                  <span className="font-medium text-gray-500">{t("noDressing")}</span>
                </SelectCard>
                {dressings.map((d) => (
                  <SelectCard
                    key={d.id}
                    selected={selectedDressing?.id === d.id}
                    onClick={() => setSelectedDressing(d)}
                  >
                    <span className="font-bold text-brown">{name(d)}</span>
                    {desc(d) && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{desc(d)}</p>
                    )}
                  </SelectCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Review ──────────────────────────────── */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-6">{t("review.title")}</h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
              {/* Base */}
              <div className="px-5 py-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                  {t("review.base")}
                </p>
                <p className="font-bold text-brown">
                  {selectedBase ? name(selectedBase) : t("review.none")}
                </p>
              </div>

              {/* Toppings */}
              <div className="px-5 py-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                  {t("review.toppings")}
                </p>
                {selectedToppings.length === 0 ? (
                  <p className="text-gray-400 text-sm">{t("review.none")}</p>
                ) : (
                  <p className="font-medium text-brown text-sm">
                    {selectedToppings.map((tp) => name(tp)).join(", ")}
                  </p>
                )}
              </div>

              {/* Protein */}
              <div className="px-5 py-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                  {t("review.protein")}
                </p>
                <p className="font-bold text-brown">
                  {selectedProtein ? name(selectedProtein) : t("review.none")}
                </p>
              </div>

              {/* Dressing */}
              <div className="px-5 py-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                  {t("review.dressing")}
                </p>
                <p className="font-bold text-brown">
                  {selectedDressing ? name(selectedDressing) : t("review.none")}
                </p>
              </div>

              {/* Price note (prices TBD) */}
              <div className="flex items-center justify-between px-5 py-4 bg-cream">
                <span className="font-bold text-brown text-lg">{t("review.total")}</span>
                <span className="font-semibold text-primary text-sm">{t("priceComingSoon")}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation buttons ──────────────────────────── */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-2xl border-2 border-brown text-brown font-semibold hover:bg-brown hover:text-white transition-colors"
            >
              {t("back")}
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-semibold transition-colors"
            >
              {t("next")}
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-2xl bg-brown hover:bg-brown-hover text-white font-semibold transition-colors"
            >
              {t("addToCart")}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
