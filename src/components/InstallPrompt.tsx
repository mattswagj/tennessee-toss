"use client";

import { useEffect, useState } from "react";
import { SaladBowlIcon } from "@/components/brand/SaladBowlIcon";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((navigator as { standalone?: boolean }).standalone) return;
    if (sessionStorage.getItem("pwa-dismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      setTimeout(() => setShow(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-dismissed", "1");
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-6 md:w-80 animate-fade-up">
      <div className="bg-cream border border-brown/15 rounded-2xl shadow-soft-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <SaladBowlIcon size={40} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-brown text-sm">Add to Home Screen</p>
          {isIOS ? (
            <p className="text-brown/60 text-xs mt-0.5 leading-relaxed">
              Tap <span className="font-medium">Share</span> then{" "}
              <span className="font-medium">Add to Home Screen</span>
            </p>
          ) : (
            <p className="text-brown/60 text-xs mt-0.5">Install for quick access & offline menu</p>
          )}
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="mt-2.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-primary-600 transition-colors"
            >
              Install App
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-brown/40 hover:text-brown transition-colors p-1"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
