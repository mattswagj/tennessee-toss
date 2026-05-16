"use client";

import { useState } from "react";
import { toast } from "sonner";

const SHARE_URL = "https://tennessee-toss.vercel.app";
const SHARE_TITLE = "Tennessee Toss — Fresh Handcrafted Salads";
const SHARE_TEXT = "Crafted fresh daily in Lebanon, TN. Bold flavors, earn rewards every visit!";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_URL });
        return;
      } catch {
        // User dismissed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      toast.success("Link copied! / ¡Enlace copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-sm text-brown/70 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg px-1"
      aria-label="Share Tennessee Toss with a friend"
    >
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
        <circle cx="15" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="15" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="7" y1="9" x2="13" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="11" x2="13" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {copied ? "Copied!" : "Share Tennessee Toss with a friend →"}
    </button>
  );
}
