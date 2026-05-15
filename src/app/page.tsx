"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { createClient, type MenuItem } from "@/lib/supabase";
import { toast } from "sonner";

const FEATURES = [
  {
    key: "fresh" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z" />
        <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "bold" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  {
    key: "rewards" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
] as const;

function MenuItemCard({
  item,
  locale,
  addLabel,
}: {
  item: MenuItem;
  locale: "en" | "es";
  addLabel: string;
}) {
  const { addItem } = useCart();
  const name = locale === "es" ? item.name_es : item.name_en;
  const description = locale === "es" ? item.description_es : item.description_en;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={name} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-cream flex items-center justify-center">
          <span className="text-5xl">🥗</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-brown text-lg leading-tight">{name}</h3>
          <span className="text-primary font-bold text-lg whitespace-nowrap">
            ${item.price.toFixed(2)}
          </span>
        </div>
        {description && (
          <p className="text-gray-500 text-sm mb-3 flex-1 line-clamp-2">{description}</p>
        )}
        {item.calories && (
          <p className="text-xs text-gray-400 mb-3">{item.calories} cal</p>
        )}
        <button
          onClick={() => {
            addItem(item);
            toast.success(`${name} added to cart`);
          }}
          className="mt-auto w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 rounded-xl transition-colors"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const tHero = useTranslations("hero");
  const tFeatures = useTranslations("features");
  const tPreview = useTranslations("menuPreview");
  const { locale } = useLanguage();

  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_featured", true)
      .eq("is_available", true)
      .order("display_order")
      .limit(6)
      .then(({ data }) => {
        if (data) setFeatured(data as MenuItem[]);
        setLoading(false);
      });
  }, []);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-primary min-h-[72vh] flex items-center justify-center text-center px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 text-balance leading-tight">
            {tHero("tagline")}
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-10">
            {tHero("subtitle")}
          </p>
          <Link
            href="/menu"
            className="inline-block bg-brown hover:bg-brown-hover text-white px-10 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg"
          >
            {tHero("orderNow")}
          </Link>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-brown text-center mb-14">
            {tFeatures("title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ key, icon }) => (
              <div
                key={key}
                className="bg-white rounded-2xl p-8 shadow-sm text-center flex flex-col items-center gap-4"
              >
                <div className="text-primary">{icon}</div>
                <h3 className="text-xl font-bold text-brown">
                  {tFeatures(`${key}.title`)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {tFeatures(`${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Menu Preview ─────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-brown">{tPreview("title")}</h2>
            <Link href="/menu" className="text-primary font-semibold text-sm hover:underline">
              {tPreview("viewAll")} →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-cream rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <span className="text-5xl block mb-4">🥗</span>
              <p>No featured items yet — add some in your Supabase dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featured.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  addLabel={tPreview("addToCart")}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="bg-brown text-white/70 text-center text-sm py-10">
        <p className="font-bold text-white text-base mb-1">Tennessee Toss</p>
        <p>© {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </main>
  );
}
