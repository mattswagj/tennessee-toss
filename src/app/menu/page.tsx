"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { createClient, type MenuItem, type MenuCategory } from "@/lib/supabase";
import { toast } from "sonner";
import { EmptyBowl } from "@/components/illustrations/EmptyBowl";
import { PriceDisclaimer } from "@/components/PriceDisclaimer";

type DietaryFilter = "vegan" | "keto" | "glutenFree";

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-primary text-white shadow-sm"
          : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function MenuCard({
  item,
  locale,
  addLabel,
  comingSoonLabel,
  freeLabel,
  priceEstimatedLabel,
}: {
  item: MenuItem;
  locale: "en" | "es";
  addLabel: string;
  comingSoonLabel: string;
  freeLabel: string;
  priceEstimatedLabel: string;
}) {
  const { addItem } = useCart();
  const name = locale === "es" ? item.name_es : item.name_en;
  const description = locale === "es" ? item.description_es : item.description_en;

  const comingSoon = item.coming_soon || !item.is_available;
  // Build-your-own model: $0 toppings/dressings are FREE (included), not "TBD".
  const isFree = !comingSoon && item.price <= 0;

  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm transition-shadow flex flex-col ${
        comingSoon ? "opacity-60" : "hover:shadow-md"
      }`}
    >
      {/* Coming Soon badge */}
      {comingSoon && (
        <span className="absolute top-3 right-3 z-10 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {comingSoonLabel}
        </span>
      )}

      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-cream flex items-center justify-center">
          <span className="text-4xl">🥗</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-brown text-base leading-tight">{name}</h3>
          {!comingSoon && (
            <span
              className="text-primary font-bold text-sm whitespace-nowrap"
              title={isFree ? undefined : priceEstimatedLabel}
            >
              {isFree ? freeLabel : `$${item.price.toFixed(2)}*`}
            </span>
          )}
        </div>
        {description && (
          <p className="text-gray-500 text-sm mb-3 flex-1 line-clamp-3">{description}</p>
        )}
        {item.calories && (
          <p className="text-xs text-gray-400 mb-3">{item.calories} cal</p>
        )}
        <button
          disabled={comingSoon}
          onClick={() => {
            if (comingSoon) return;
            addItem(item);
            toast.success(`${name} added to cart`);
          }}
          className="mt-auto w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 rounded-xl transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
        >
          {comingSoon ? comingSoonLabel : addLabel}
        </button>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const t = useTranslations("menu");
  const { locale } = useLanguage();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeDietary, setActiveDietary] = useState<DietaryFilter | null>(null);

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),
      // Include unavailable items too — they render as "Coming Soon".
      supabase
        .from("menu_items")
        .select("*")
        .order("display_order"),
    ]).then(([catRes, itemRes]) => {
      if (catRes.data) setCategories(catRes.data as MenuCategory[]);
      if (itemRes.data) setItems(itemRes.data as MenuItem[]);
      setLoading(false);
    });
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeCategoryId && item.category_id !== activeCategoryId) return false;
    return true;
  });

  const dietaryFilters: { key: DietaryFilter; label: string }[] = [
    { key: "vegan", label: t("vegan") },
    { key: "keto", label: t("keto") },
    { key: "glutenFree", label: t("glutenFree") },
  ];

  return (
    <main className="min-h-screen bg-cream">
      {/* ── Page header ─────────────────────────────── */}
      <div className="bg-brown py-14 px-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">{t("title")}</h1>
        <p className="text-white/70 text-base">{t("subtitle")}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* ── Placeholder-price disclaimer (remove once prices confirmed) ── */}
        <div className="mb-6">
          <PriceDisclaimer note={t("priceNote")} />
        </div>

        {/* ── Category filters ────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <FilterButton
            active={activeCategoryId === null}
            onClick={() => setActiveCategoryId(null)}
          >
            {t("all")}
          </FilterButton>
          {categories.map((cat) => (
            <FilterButton
              key={cat.id}
              active={activeCategoryId === cat.id}
              onClick={() =>
                setActiveCategoryId(cat.id === activeCategoryId ? null : cat.id)
              }
            >
              {locale === "es" ? cat.name_es : cat.name_en}
            </FilterButton>
          ))}
        </div>

        {/* ── Dietary filters ─────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {dietaryFilters.map(({ key, label }) => (
            <FilterButton
              key={key}
              active={activeDietary === key}
              onClick={() =>
                setActiveDietary(activeDietary === key ? null : key)
              }
            >
              {label}
            </FilterButton>
          ))}
        </div>

        {/* ── Item grid ───────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <EmptyBowl size={100} className="opacity-60" aria-hidden="true" />
            <p className="font-serif text-xl font-semibold text-brown">{t("noItems")}</p>
            <p className="text-brown/50 text-sm">
              {activeCategoryId || activeDietary
                ? "Try clearing your filters / Intenta quitar los filtros"
                : "Check back soon! / ¡Vuelve pronto!"}
            </p>
            {(activeCategoryId || activeDietary) && (
              <button
                onClick={() => { setActiveCategoryId(null); setActiveDietary(null); }}
                className="bg-primary text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                Clear filters / Quitar filtros
              </button>
            )}
            {!activeCategoryId && !activeDietary && (
              <Link href="/build" className="bg-primary text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
                Build your own / Arma la tuya
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                locale={locale}
                addLabel={t("addToCart")}
                comingSoonLabel={t("comingSoon")}
                freeLabel={t("free")}
                priceEstimatedLabel={t("priceEstimated")}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
