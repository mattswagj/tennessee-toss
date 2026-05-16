"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { REWARD_TIERS } from "@/types/loyalty";
import { useLanguage } from "@/context/LanguageContext";

interface RewardTierProgressProps {
  currentPoints: number;
}

export function RewardTierProgress({ currentPoints }: RewardTierProgressProps) {
  const t = useTranslations("account.loyalty");
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h2 className="font-bold text-brown text-lg">{t("tiers")}</h2>
        <span className="text-gray-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5">
          {REWARD_TIERS.map((tier) => {
            const pct = Math.min((currentPoints / tier.points) * 100, 100);
            const earned = currentPoints >= tier.points;
            const label = locale === "es" ? tier.label_es : tier.label_en;

            return (
              <div key={tier.points}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-brown">
                    {earned ? "✓ " : ""}{label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {Math.min(currentPoints, tier.points).toLocaleString()} / {tier.points.toLocaleString()} pts
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: earned ? "#8FAF6E" : "#6B4C2A",
                    }}
                  />
                </div>
                {!earned && (
                  <p className="text-xs text-gray-400 mt-1">
                    {(tier.points - currentPoints).toLocaleString()} pts {t("toGo")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
