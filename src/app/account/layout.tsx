import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Tennessee Toss",
  description: "Manage your Tennessee Toss loyalty account, points, and order history.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
