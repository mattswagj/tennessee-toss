import type { Metadata } from "next";

const BASE_URL = "https://tennessee-toss.vercel.app";

export const metadata: Metadata = {
  title: "About | Tennessee Toss — Our Story",
  description:
    "Tennessee Toss is a fresh, handcrafted salad shop in Lebanon, Tennessee. Crafted fresh daily, made with care.",
  alternates: {
    canonical: `${BASE_URL}/about`,
    languages: {
      en: `${BASE_URL}/en/about`,
      es: `${BASE_URL}/es/about`,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Tennessee Toss",
    locale: "en_US",
    alternateLocale: ["es_US"],
    url: `${BASE_URL}/about`,
    title: "About | Tennessee Toss — Our Story",
    description:
      "Tennessee Toss is a fresh, handcrafted salad shop in Lebanon, Tennessee. Crafted fresh daily, made with care.",
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
    title: "About | Tennessee Toss — Our Story",
    description:
      "Tennessee Toss is a fresh, handcrafted salad shop in Lebanon, Tennessee. Crafted fresh daily, made with care.",
    images: ["/og-image.png"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
