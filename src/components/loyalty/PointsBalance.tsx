"use client";

import { useTranslations } from "next-intl";

interface PointsBalanceProps {
  current: number;
  lifetime: number;
  thisMonth: number;
}

export function PointsBalance({ current, lifetime, thisMonth }: PointsBalanceProps) {
  const t = useTranslations("account.loyalty");

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
        <p className="text-3xl font-bold text-primary">{current.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-1">{t("currentPoints")}</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
        <p className="text-3xl font-bold text-brown">{thisMonth.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-1">{t("monthPoints")}</p>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
        <p className="text-3xl font-bold text-gray-600">{lifetime.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-1">{t("lifetimePoints")}</p>
      </div>
    </div>
  );
}
