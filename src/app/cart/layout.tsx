import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart | Tennessee Toss",
  description: "Review your order, apply loyalty points, and proceed to checkout.",
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
