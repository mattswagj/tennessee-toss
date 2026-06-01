import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { HtmlLang } from "@/components/HtmlLang";
import { Toaster } from "sonner";

// ── Local fonts ────────────────────────────────────────────────

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// ── Google fonts ───────────────────────────────────────────────

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// ── Metadata ───────────────────────────────────────────────────

const BASE_URL = "https://tennessee-toss.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Tennessee Toss | Fresh Handcrafted Salads in Lebanon, TN",
    template: "%s | Tennessee Toss",
  },
  description:
    "Bold flavors, fresh ingredients, crafted fresh daily. Order salads online or build your own. Earn rewards every visit. Lebanon, Tennessee.",
  keywords: [
    "salads",
    "Lebanon Tennessee",
    "fresh",
    "healthy food",
    "online ordering",
    "salad bowl",
    "loyalty rewards",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tennessee Toss",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#6B4C2A" }],
  },
  openGraph: {
    type: "website",
    siteName: "Tennessee Toss",
    locale: "en_US",
    alternateLocale: ["es_US"],
    url: BASE_URL,
    title: "Tennessee Toss | Fresh Handcrafted Salads in Lebanon, TN",
    description:
      "Bold flavors, fresh ingredients, crafted fresh daily. Order salads online or build your own. Earn rewards every visit.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tennessee Toss — Fresh Handcrafted Salads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tennessee Toss | Fresh Handcrafted Salads in Lebanon, TN",
    description:
      "Bold flavors, fresh ingredients, crafted fresh daily. Order salads online or build your own.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      en: `${BASE_URL}/en`,
      es: `${BASE_URL}/es`,
    },
  },
  other: {
    "msapplication-TileColor": "#8FAF6E",
    "color-scheme": "light",
  },
};

export const viewport: Viewport = {
  themeColor: "#8FAF6E",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tennessee Toss" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${playfair.variable} antialiased font-sans`}
      >
        <LanguageProvider>
          <HtmlLang />
          <AuthProvider>
            <CartProvider>
              <Navbar />
              {children}
              {/* To re-enable: set NEXT_PUBLIC_ENABLE_CHAT=true in Vercel env vars and redeploy. */}
              {process.env.NEXT_PUBLIC_ENABLE_CHAT === "true" && <ChatWidget />}
              <InstallPrompt />
              <ServiceWorkerRegistrar />
              <Toaster richColors position="bottom-right" />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
