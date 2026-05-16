"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface RedemptionCodeProps {
  code: string;
  onClose: () => void;
}

function QRImage({ value, size = 160 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    import("qrcode").then((QRCode) =>
      QRCode.toDataURL(value, { width: size, margin: 2 }).then(setDataUrl)
    );
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-gray-100 rounded-xl animate-pulse mx-auto"
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`Redemption QR – ${value}`}
      width={size}
      height={size}
      className="mx-auto rounded-xl"
    />
  );
}

export function RedemptionCode({ code, onClose }: RedemptionCodeProps) {
  const t = useTranslations("account.loyalty");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {t("redeemCode")}
        </p>
        <p className="font-mono text-4xl font-bold text-brown tracking-widest my-4">
          {code}
        </p>
        <div className="mb-4">
          <QRImage value={code} size={160} />
        </div>
        <p className="text-sm text-gray-500 mb-6">{t("redeemInstructions")}</p>
        <button
          onClick={onClose}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {t("done")}
        </button>
      </div>
    </div>
  );
}
