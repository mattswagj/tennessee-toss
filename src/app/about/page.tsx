"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SaladBowlIcon } from "@/components/brand/SaladBowlIcon";
import { CraftedFreshBadge } from "@/components/brand/CraftedFreshBadge";
import { LeafDecoration } from "@/components/illustrations/LeafDecoration";

// ── Scroll-animation hook (mirrors the homepage pattern) ───────
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

// ── Pillar icons (brand brown, simple shapes — no emojis) ──────
function HeartIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
      <path
        d="M16 27S4 19.5 4 11.5C4 7.9 6.9 5 10.5 5c2.2 0 4.2 1.1 5.5 2.9C17.3 6.1 19.3 5 21.5 5 25.1 5 28 7.9 28 11.5 28 19.5 16 27 16 27Z"
        fill="#6B4C2A"
      />
    </svg>
  );
}
function HouseIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
      <path d="M16 4 3 15h3v13h7v-8h6v8h7V15h3L16 4Z" fill="#6B4C2A" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function AboutPage() {
  const t = useTranslations("about");

  const whoRef = useScrollAnimation();
  const missionRef = useScrollAnimation();
  const differentRef = useScrollAnimation();
  const findUsRef = useScrollAnimation();

  const pillars = [
    { key: "pillar1", Icon: SaladBowlIcon, isBrand: true },
    { key: "pillar2", Icon: HeartIcon, isBrand: false },
    { key: "pillar3", Icon: HouseIcon, isBrand: false },
  ] as const;

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary px-6 py-24 md:py-32 text-center">
        {/* Subtle leaf decoration in the corners */}
        <LeafDecoration variant="left" size={170} className="absolute -left-6 -top-4 pointer-events-none" opacity={0.18} />
        <LeafDecoration variant="right" size={150} className="absolute -right-4 bottom-0 pointer-events-none" opacity={0.18} />
        <LeafDecoration variant="right" size={90} className="absolute right-10 top-6 pointer-events-none" opacity={0.12} />
        <LeafDecoration variant="left" size={90} className="absolute left-12 bottom-6 pointer-events-none" opacity={0.12} />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="font-script text-6xl md:text-7xl lg:text-8xl text-cream leading-none mb-6">
            {t("heroTitle")}
          </h1>
          <CraftedFreshBadge />
        </div>
      </section>

      {/* ── Who We Are ────────────────────────────────── */}
      <section className="py-20 px-6 bg-cream">
        <div ref={whoRef} className="animate-on-scroll max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Illustration — salad bowl in a soft brown circle frame */}
          <div className="flex justify-center">
            <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-brown/10 border-4 border-brown/15 flex items-center justify-center shadow-soft">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-90" />
              <SaladBowlIcon size={200} className="relative drop-shadow-lg" />
            </div>
          </div>

          {/* Copy */}
          <div className="text-center md:text-left">
            <p className="font-script text-primary text-2xl mb-2">{t("heroBadge")}</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brown mb-6">
              {t("whoWeAreTitle")}
            </h2>
            {/* TODO: Replace placeholder bio with Jordi's actual story */}
            <p className="font-serif text-brown/75 text-lg leading-relaxed">
              {t("whoWeAreBody")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Mission ───────────────────────────────── */}
      <section className="relative overflow-hidden py-20 px-6 bg-primary">
        <LeafDecoration variant="left" size={160} className="absolute -left-8 top-0 pointer-events-none" opacity={0.14} />
        <LeafDecoration variant="right" size={140} className="absolute -right-6 bottom-0 pointer-events-none" opacity={0.14} />
        <div ref={missionRef} className="animate-on-scroll relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cream mb-6">
            {t("missionTitle")}
          </h2>
          {/* TODO: Confirm mission statement wording with Jordi */}
          <p className="text-cream/90 text-xl md:text-2xl leading-relaxed text-balance">
            {t("missionBody")}
          </p>
        </div>
      </section>

      {/* ── What Makes Us Different ───────────────────── */}
      <section className="py-20 px-6 bg-cream">
        <div ref={differentRef} className="animate-on-scroll max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brown text-center mb-14">
            {t("differentTitle")}
          </h2>
          {/* TODO: Have Jordi confirm or rewrite these three pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map(({ key, Icon, isBrand }) => (
              <div
                key={key}
                className="rounded-2xl p-8 bg-white border border-brown/8 shadow-soft hover:shadow-soft-lg transition-shadow flex flex-col items-center text-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  {isBrand ? <Icon size={48} /> : <Icon />}
                </div>
                <h3 className="font-serif text-xl font-bold text-brown">{t(`${key}Title`)}</h3>
                <p className="text-brown/60 text-sm leading-relaxed">{t(`${key}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Find Us ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-cream">
        <div ref={findUsRef} className="animate-on-scroll max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brown mb-6">
            {t("findUsTitle")}
          </h2>
          {/* TODO: Add real address, hours, and phone number once Jordi provides them */}
          <p className="text-brown/70 text-lg leading-relaxed mb-8">
            {t("findUsBody")}
          </p>
          <a
            href="https://www.instagram.com/tennesseetoss/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-brown hover:bg-brown-800 text-cream px-8 py-4 rounded-full font-semibold text-base transition-colors shadow-soft focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <InstagramGlyph />
            {t("followInstagram")}
          </a>
        </div>
      </section>

      {/* ── CTA footer strip ──────────────────────────── */}
      <section className="relative overflow-hidden bg-primary px-6 py-20 text-center">
        <LeafDecoration variant="left" size={150} className="absolute -left-6 top-2 pointer-events-none" opacity={0.15} />
        <LeafDecoration variant="right" size={150} className="absolute -right-6 bottom-2 pointer-events-none" opacity={0.15} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-script text-4xl md:text-5xl text-cream leading-tight mb-8">
            {t("ctaHeadline")}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center bg-cream text-brown hover:bg-primary-100 px-8 py-3.5 rounded-full font-semibold text-base transition-colors shadow-soft"
            >
              {t("orderNow")}
            </Link>
            <Link
              href="/build"
              className="inline-flex items-center justify-center border-2 border-cream text-cream hover:bg-cream/10 px-8 py-3.5 rounded-full font-semibold text-base transition-colors"
            >
              {t("buildYourOwn")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
