"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { createClient, type MenuItem } from "@/lib/supabase";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand/Wordmark";
import { SaladBowlIcon } from "@/components/brand/SaladBowlIcon";
import { CraftedFreshBadge } from "@/components/brand/CraftedFreshBadge";
import { LeafDecoration } from "@/components/illustrations/LeafDecoration";

// ── Scroll-animation hook ──────────────────────────────────────
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("is-visible"); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Feature card icons ─────────────────────────────────────────
function LeafIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <path d="M4 28 C8 18 20 10 28 4 C22 16 12 24 4 28Z" fill="#8FAF6E" />
      <path d="M4 28 L18 14" stroke="#5a7a3e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function FlameIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <path d="M16 28c-5 0-9-4-9-9 0-4 3-7 5-9 0 3 1 5 3 6 0-2 1-5 4-7 1 4 4 6 4 10 0 5-3 9-7 9Z" fill="#e05454" opacity="0.85" />
      <path d="M16 24c-2 0-4-2-4-4 0-2 2-4 2-4s1 2 3 2c2 0 3-2 3-2s1 2 1 4c0 2-3 4-5 4Z" fill="#f07878" opacity="0.7" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <path d="M16 4l3 7h8l-6 5 2 8-7-4-7 4 2-8-6-5h8z" fill="#d4a857" />
    </svg>
  );
}

const FEATURES = [
  { key: "fresh" as const, Icon: LeafIcon, color: "bg-primary/10 text-primary" },
  { key: "bold" as const, Icon: FlameIcon, color: "bg-red-50 text-red-500" },
  { key: "rewards" as const, Icon: StarIcon, color: "bg-amber-50 text-amber-600" },
] as const;

// ── Menu item card ─────────────────────────────────────────────
function MenuItemCard({ item, locale, addLabel }: { item: MenuItem; locale: "en" | "es"; addLabel: string }) {
  const { addItem } = useCart();
  const name = locale === "es" ? item.name_es : item.name_en;
  const description = locale === "es" ? item.description_es : item.description_en;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-shadow flex flex-col group">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-44 bg-cream flex items-center justify-center">
          <SaladBowlIcon size={72} />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-brown text-base leading-tight">{name}</h3>
          <span className="text-primary-700 font-bold text-base whitespace-nowrap">${item.price.toFixed(2)}</span>
        </div>
        {description && <p className="text-brown/60 text-sm mb-3 flex-1 line-clamp-2">{description}</p>}
        {item.calories && <p className="text-xs text-brown/40 mb-3">{item.calories} cal</p>}
        <button
          onClick={() => { addItem(item); toast.success(`${name} added!`); }}
          className="mt-auto w-full bg-primary hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function HomePage() {
  const tHero = useTranslations("hero");
  const tFeatures = useTranslations("features");
  const tPreview = useTranslations("menuPreview");
  const tHome = useTranslations("home");
  const { locale } = useLanguage();

  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const featuresRef = useScrollAnimation();
  const storyRef = useScrollAnimation();
  const loyaltyRef = useScrollAnimation();
  const menuRef = useScrollAnimation();

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
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-100 via-cream to-cream min-h-[88vh] flex items-center">
        {/* Decorative leaves */}
        <LeafDecoration variant="left" size={180} className="absolute -left-6 top-10 pointer-events-none" opacity={0.22} />
        <LeafDecoration variant="right" size={140} className="absolute right-0 bottom-16 pointer-events-none" opacity={0.16} />
        <LeafDecoration variant="right" size={100} className="absolute right-24 top-8 pointer-events-none" opacity={0.12} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Text side */}
          <div className="text-center md:text-left">
            <div className="mb-6 flex justify-center md:justify-start">
              <CraftedFreshBadge />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brown mb-4 text-balance leading-tight">
              {tHero("tagline")}
            </h1>
            <Wordmark size="xl" color="#8FAF6E" className="block mb-6" />
            <p className="text-brown/70 text-lg md:text-xl mb-10 text-balance">
              {tHero("subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center bg-brown hover:bg-brown-800 text-cream px-8 py-3.5 rounded-full font-semibold text-base transition-colors shadow-soft"
              >
                {tHero("orderNow")}
              </Link>
              <Link
                href="/build"
                className="inline-flex items-center justify-center border-2 border-brown/30 text-brown hover:bg-brown/5 px-8 py-3.5 rounded-full font-semibold text-base transition-colors"
              >
                {tHome("buildOwn")}
              </Link>
            </div>
          </div>

          {/* Illustration side */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl scale-90" />
              <SaladBowlIcon size={280} className="relative drop-shadow-xl animate-float" />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div ref={featuresRef} className="animate-on-scroll max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brown mb-3">
              {tFeatures("title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ key, Icon, color }) => (
              <div key={key} className="rounded-2xl p-8 border border-brown/8 shadow-soft hover:shadow-soft-lg transition-shadow flex flex-col items-center text-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                  <Icon />
                </div>
                <h3 className="font-serif text-xl font-bold text-brown">{tFeatures(`${key}.title`)}</h3>
                <p className="text-brown/60 text-sm leading-relaxed">{tFeatures(`${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-cream relative overflow-hidden">
        <LeafDecoration variant="left" size={200} className="absolute -left-10 top-0 pointer-events-none" opacity={0.15} />
        <div ref={storyRef} className="animate-on-scroll relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-script text-primary text-2xl mb-3">{tHome("storyEyebrow")}</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brown mb-6">{tHome("storyTitle")}</h2>
          <p className="text-brown/70 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            {tHome("storyBody")}
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brown font-semibold border-b-2 border-primary pb-0.5 hover:text-primary transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            {tHome("storyInstagram")}
          </a>
        </div>
      </section>

      {/* ── Loyalty explainer ─────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div ref={loyaltyRef} className="animate-on-scroll max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-brown to-brown-800 rounded-3xl p-10 md:p-14 text-center text-cream relative overflow-hidden">
            <LeafDecoration variant="right" size={160} className="absolute right-0 bottom-0 pointer-events-none" opacity={0.12} />
            <LeafDecoration variant="left" size={120} className="absolute left-0 top-0 pointer-events-none" opacity={0.1} />
            <div className="relative z-10">
              <p className="font-script text-primary-200 text-2xl mb-3">{tHome("loyaltyEyebrow")}</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">{tHome("loyaltyTitle")}</h2>
              <p className="text-cream/75 text-lg max-w-xl mx-auto mb-8 leading-relaxed">{tHome("loyaltyBody")}</p>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {[
                  { pts: "500", label: tHome("tier1") },
                  { pts: "1,000", label: tHome("tier2") },
                  { pts: "2,000", label: tHome("tier3") },
                ].map(({ pts, label }) => (
                  <div key={pts} className="bg-cream/10 backdrop-blur-sm border border-cream/20 rounded-2xl px-6 py-4 text-center min-w-[130px]">
                    <div className="font-bold text-xl text-cream">{pts} pts</div>
                    <div className="text-cream/70 text-xs mt-1">{label}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/account"
                className="inline-flex items-center justify-center bg-cream text-brown hover:bg-primary-100 font-semibold px-8 py-3.5 rounded-full transition-colors shadow-soft"
              >
                {tHome("loyaltyCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured menu items ────────────────────────── */}
      <section className="py-20 px-6 bg-cream">
        <div ref={menuRef} className="animate-on-scroll max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <p className="font-script text-primary text-xl mb-1">{tHome("menuEyebrow")}</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brown">{tPreview("title")}</h2>
            </div>
            <Link href="/menu" className="text-brown font-semibold text-sm border-b-2 border-primary pb-0.5 hover:text-primary transition-colors">
              {tPreview("viewAll")} →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-20">
              <SaladBowlIcon size={100} className="mx-auto mb-4 opacity-40" />
              <p className="text-brown/40">No featured items yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featured.map((item) => (
                <MenuItemCard key={item.id} item={item} locale={locale} addLabel={tPreview("addToCart")} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="bg-brown text-cream">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="text-center md:text-left">
              <Wordmark size="lg" color="#F5F0E8" className="block mb-2" />
              <p className="text-cream/60 text-sm">{tHome("footerTagline")}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 text-sm text-cream/70">
              <div className="flex flex-col gap-2 items-center sm:items-start">
                <span className="font-semibold text-cream uppercase tracking-wide text-xs mb-1">Menu</span>
                <Link href="/menu" className="hover:text-cream transition-colors">Full Menu</Link>
                <Link href="/build" className="hover:text-cream transition-colors">Build a Salad</Link>
                <Link href="/account" className="hover:text-cream transition-colors">My Account</Link>
              </div>
              <div className="flex flex-col gap-2 items-center sm:items-start">
                <span className="font-semibold text-cream uppercase tracking-wide text-xs mb-1">Connect</span>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">Instagram</a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">Facebook</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-cream/15 text-center text-cream/40 text-sm">
            © {new Date().getFullYear()} Tennessee Toss. All rights reserved. · Lebanon, TN
          </div>
        </div>
      </footer>
    </main>
  );
}
