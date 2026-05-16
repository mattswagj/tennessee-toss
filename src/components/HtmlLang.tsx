"use client";

import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export function HtmlLang() {
  const { locale } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
