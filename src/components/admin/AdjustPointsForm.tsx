"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { adjustPoints } from "@/actions/loyalty";
import { toast } from "sonner";

interface AdjustPointsFormProps {
  userId: string;
  currentPoints: number;
  onSuccess: (newPoints: number) => void;
}

export function AdjustPointsForm({ userId, currentPoints, onSuccess }: AdjustPointsFormProps) {
  const t = useTranslations("dashboard.memberDetail");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(amount, 10);
    if (isNaN(pts) || pts === 0) return;
    if (!reason.trim()) return;

    setLoading(true);
    const result = await adjustPoints(userId, pts, reason.trim());
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(t("adjustSuccess"));
    onSuccess(currentPoints + pts);
    setAmount("");
    setReason("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">
          {t("amount")}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 100 or -50"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          required
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">
          {t("reason")}
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
      >
        {loading ? "…" : t("submit")}
      </button>
    </form>
  );
}
