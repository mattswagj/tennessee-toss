import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Menu | Tennessee Toss — Fresh Handcrafted Salads",
  description:
    "Browse our signature salads, dressings, and add-ons. Fresh, bold flavors crafted daily in Lebanon, Tennessee.",
  openGraph: {
    title: "Our Menu — Tennessee Toss",
    description: "Browse our signature salads, dressings, and add-ons.",
    url: "https://tennessee-toss.vercel.app/menu",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
