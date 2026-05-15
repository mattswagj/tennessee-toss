"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { createClient, type MenuItem } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ── Static data ───────────────────────────────────────────────

const BASE_PRICE = 8;

const BASES = [
  { id: "romaine", name_en: "Romaine", name_es: "Lechuga Romana" },
  { id: "spinach", name_en: "Spinach", name_es: "Espinacas" },
  { id: "mixed", name_en: "Mixed Greens", name_es: "Mezcla de Lechugas" },
  { id: "kale", name_en: "Kale", name_es: "Col Rizada" },
] as const;

const TOPPINGS = [
  { id: "tomatoes", name_en: "Tomatoes", name_es: "Tomates" },
  { id: "cucumbers", name_en: "Cucumbers", name_es: "Pepinos" },
  { id: "redOnion", name_en: "Red Onion", name_es: "Cebolla Roja" },
  { id: "corn", name_en: "Corn", name_es: "Maíz" },
  { id: "croutons", name_en: "Croutons", name_es: "Crutones" },
  { id: "avocado", name_en: "Avocado", name_es: "Aguacate" },
  { id: "baconBits", name_en: "Bacon Bits", name_es: "Trozos de Tocino" },
] as const;

type ToppingId = (typeof TOPPINGS)[number]["id"];
type BaseId = (typeof BASES)[number]["id"];

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
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
        selected
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
  const [selectedBase, setSelectedBase] = useState<BaseId | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<ToppingId[]>([]);
  const [selectedProtein, setSelectedProtein] = useState<MenuItem | null>(null);
  const [selectedDressing, setSelectedDressing] = useState<MenuItem | null>(null);

  const [proteins, setProteins] = useState<MenuItem[]>([]);
  const [dressings, setDressings] = useState<MenuItem[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  const TOTAL_STEPS = 5;

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("menu_items")
        .select("*, menu_categories!inner(slug)")
        .eq("menu_categories.slug", "proteins")
        .eq("is_available", true),
      supabase
        .from("menu_items")
        .select("*, menu_categories!inner(slug)")
        .eq("menu_categories.slug", "dressings")
        .eq("is_available", true),
    ]).then(([pRes, dRes]) => {
      if (pRes.data) setProteins(pRes.data as MenuItem[]);
      if (dRes.data) setDressings(dRes.data as MenuItem[]);
      setDbLoading(false);
    });
  }, []);

  const runningTotal =
    BASE_PRICE +
    (selectedProtein?.price ?? 0) +
    (selectedDressing?.price ?? 0);

  const toggleTopping = (id: ToppingId) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
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
    const baseObj = BASES.find((b) => b.id === selectedBase)!;
    const toppingObjs = selectedToppings.map(
      (id) => TOPPINGS.find((t) => t.id === id)!
    );

    addCustomSalad({
      base: selectedBase,
      baseName_en: baseObj.name_en,
      baseName_es: baseObj.name_es,
      toppings: toppingObjs,
      protein: selectedProtein,
      dressing: selectedDressing,
      price: runningTotal,
    });

    toast.success(locale === "es" ? "¡Ensalada agregada al carrito!" : "Custom salad added to cart!");
    router.push("/cart");
  };

  const stepLabel = (n: number) => {
    const keys: Record<number, string> = {
      1: t("step1Label"),
      2: t("step2Label"),
      3: t("step3Label"),
      4: t("step4Label"),
      5: t("step5Label"),
    };
    return keys[n] ?? "";
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-brown py-12 px-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">{t("title")}</h1>
        <p className="text-white/70">{t("subtitle")}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-6">
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

        {/* Running total pill */}
        <div className="flex justify-end mb-6">
          <div className="bg-brown text-white text-sm font-semibold px-4 py-2 rounded-full">
            {t("runningTotal")}: ${runningTotal.toFixed(2)}
          </div>
        </div>

        {/* ── Step 1: Base ───────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-6">{t("step1Label")}</h2>
            <div className="grid grid-cols-2 gap-4">
              {BASES.map((base) => (
                <SelectCard
                  key={base.id}
                  selected={selectedBase === base.id}
                  onClick={() => setSelectedBase(base.id)}
                >
                  <div className="font-bold text-brown">
                    {locale === "es" ? base.name_es : base.name_en}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">${BASE_PRICE.toFixed(2)}</div>
                </SelectCard>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Toppings ───────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-2">{t("step2Label")}</h2>
            <p className="text-sm text-gray-500 mb-6">{t("toppingsTitle")}</p>
            <div className="grid grid-cols-2 gap-3">
              {TOPPINGS.map((topping) => {
                const active = selectedToppings.includes(topping.id);
                return (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping.id)}
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
                    <span className="text-sm font-medium text-brown">
                      {locale === "es" ? topping.name_es : topping.name_en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Protein ────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-2">{t("step3Label")}</h2>
            <p className="text-sm text-gray-500 mb-6">{t("optional")}</p>
            {dbLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* No protein option */}
                <SelectCard
                  selected={selectedProtein === null}
                  onClick={() => setSelectedProtein(null)}
                >
                  <span className="font-medium text-gray-500">{t("noProtein")}</span>
                </SelectCard>
                {proteins.map((p) => (
                  <SelectCard
                    key={p.id}
                    selected={selectedProtein?.id === p.id}
                    onClick={() => setSelectedProtein(p)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brown">
                        {locale === "es" ? p.name_es : p.name_en}
                      </span>
                      <span className="text-primary font-bold">+${p.price.toFixed(2)}</span>
                    </div>
                    {(locale === "es" ? p.description_es : p.description_en) && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {locale === "es" ? p.description_es : p.description_en}
                      </p>
                    )}
                  </SelectCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Dressing ───────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-2">{t("step4Label")}</h2>
            <p className="text-sm text-gray-500 mb-6">{t("optional")}</p>
            {dbLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
                ))}
              </div>
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
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brown">
                        {locale === "es" ? d.name_es : d.name_en}
                      </span>
                      <span className="text-primary font-bold">+${d.price.toFixed(2)}</span>
                    </div>
                  </SelectCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Review ─────────────────────────────── */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-brown mb-6">{t("review.title")}</h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
              {/* Base */}
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    {t("review.base")}
                  </p>
                  <p className="font-bold text-brown">
                    {selectedBase
                      ? locale === "es"
                        ? BASES.find((b) => b.id === selectedBase)?.name_es
                        : BASES.find((b) => b.id === selectedBase)?.name_en
                      : t("review.none")}
                  </p>
                </div>
                <span className="text-primary font-bold">${BASE_PRICE.toFixed(2)}</span>
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
                    {selectedToppings
                      .map((id) => {
                        const top = TOPPINGS.find((t) => t.id === id)!;
                        return locale === "es" ? top.name_es : top.name_en;
                      })
                      .join(", ")}
                  </p>
                )}
              </div>

              {/* Protein */}
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    {t("review.protein")}
                  </p>
                  <p className="font-bold text-brown">
                    {selectedProtein
                      ? locale === "es"
                        ? selectedProtein.name_es
                        : selectedProtein.name_en
                      : t("review.none")}
                  </p>
                </div>
                {selectedProtein && (
                  <span className="text-primary font-bold">
                    +${selectedProtein.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Dressing */}
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    {t("review.dressing")}
                  </p>
                  <p className="font-bold text-brown">
                    {selectedDressing
                      ? locale === "es"
                        ? selectedDressing.name_es
                        : selectedDressing.name_en
                      : t("review.none")}
                  </p>
                </div>
                {selectedDressing && (
                  <span className="text-primary font-bold">
                    +${selectedDressing.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-5 py-4 bg-cream">
                <span className="font-bold text-brown text-lg">{t("review.total")}</span>
                <span className="font-bold text-brown text-xl">${runningTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation buttons ─────────────────────────── */}
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
