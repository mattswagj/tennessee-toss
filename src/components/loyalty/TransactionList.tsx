"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import type { LoyaltyTransaction } from "@/types/loyalty";

interface TransactionListProps {
  transactions: LoyaltyTransaction[];
}

const TYPE_COLORS: Record<string, string> = {
  earned:            "text-primary bg-primary/10",
  redeemed:          "text-red-500 bg-red-50",
  manual_adjustment: "text-blue-600 bg-blue-50",
};

export function TransactionList({ transactions }: TransactionListProps) {
  const t = useTranslations("account.loyalty");
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const typeLabel = (type: string) => {
    if (type === "earned") return t("earned");
    if (type === "redeemed") return t("redeemed");
    return t("adjustment");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h2 className="font-bold text-brown text-lg">{t("transactions")}</h2>
        <span className="text-gray-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-400">{t("noTransactions")}</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          TYPE_COLORS[tx.type] ?? "text-gray-500 bg-gray-100"
                        }`}
                      >
                        {typeLabel(tx.type)}
                      </span>
                      <span className="text-xs text-gray-400">{fmt(tx.created_at)}</span>
                    </div>
                    {tx.description && (
                      <p className="text-xs text-gray-500 truncate">{tx.description}</p>
                    )}
                  </div>
                  <span
                    className={`font-bold text-sm whitespace-nowrap ${
                      tx.points > 0 ? "text-primary" : "text-red-500"
                    }`}
                  >
                    {tx.points > 0 ? "+" : ""}{tx.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
