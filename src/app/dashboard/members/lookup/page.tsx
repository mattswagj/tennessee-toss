"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { MemberLookupBar } from "@/components/admin/MemberLookupBar";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

export default function LookupPage() {
  const t = useTranslations("dashboard");
  const tL = useTranslations("dashboard.lookup");
  const { user, loading: authLoading } = useAuth();

  const isAdmin = user && (!ADMIN_EMAIL || user.email === ADMIN_EMAIL);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-4">
        <span className="text-6xl mb-4">🔒</span>
        <h1 className="text-2xl font-bold text-brown mb-2">{t("unauthorized")}</h1>
        <p className="text-gray-500">{t("unauthorizedMsg")}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-brown py-10 px-6">
        <div className="max-w-xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">{tL("title")}</h1>
          <Link
            href="/dashboard/members"
            className="text-white/70 text-sm hover:text-white transition-colors"
          >
            ← {t("members.title")}
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        <MemberLookupBar />
      </div>
    </main>
  );
}
