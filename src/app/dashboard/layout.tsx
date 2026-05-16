import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Dashboard | Tennessee Toss",
  description: "Tennessee Toss admin dashboard — orders, members, and redemptions.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
