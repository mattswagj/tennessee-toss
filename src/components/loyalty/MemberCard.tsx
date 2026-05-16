"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface MemberCardProps {
  memberNumber: string | null;
  name: string | null;
}

function QRImage({ value, size = 180 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    import("qrcode").then((QRCode) =>
      QRCode.toDataURL(value, { width: size, margin: 2, color: { dark: "#6B4C2A", light: "#F5F0E8" } })
        .then(setDataUrl)
    );
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-cream/40 rounded-xl animate-pulse mx-auto"
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR code – ${value}`}
      width={size}
      height={size}
      className="mx-auto rounded-xl"
    />
  );
}

export function MemberCard({ memberNumber, name }: MemberCardProps) {
  const t = useTranslations("account.memberCard");

  if (!memberNumber) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm text-center text-sm text-gray-400">
        {t("generating")}
      </div>
    );
  }

  return (
    <div className="bg-brown rounded-2xl p-6 shadow-sm text-white text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
        {t("title")}
      </p>
      {name && <p className="font-semibold text-lg mb-3">{name}</p>}

      <div className="bg-cream/10 rounded-xl p-4 mb-4 inline-block">
        <QRImage value={memberNumber} size={180} />
      </div>

      <p className="text-xs text-white/60 mb-1">{t("number")}</p>
      <p className="font-mono text-2xl font-bold tracking-widest">{memberNumber}</p>
      <p className="text-xs text-white/50 mt-2">{t("scanQR")}</p>
    </div>
  );
}
