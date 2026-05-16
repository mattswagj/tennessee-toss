import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Own Salad | Tennessee Toss",
  description:
    "Pick your base, protein, toppings, and dressing. Create your perfect salad bowl, step by step.",
  openGraph: {
    title: "Build Your Own Salad — Tennessee Toss",
    description: "Pick your base, protein, toppings, and dressing.",
    url: "https://tennessee-toss.vercel.app/build",
  },
};

export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
