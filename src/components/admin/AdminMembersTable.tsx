"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { AdminMember } from "@/types/loyalty";

type SortKey = "created_at" | "current_points" | "lifetime_points";

interface AdminMembersTableProps {
  members: AdminMember[];
  total: number;
  page: number;
  limit: number;
  sort: SortKey;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onPage: (page: number) => void;
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="text-gray-300 ml-1">↕</span>;
  return <span className="text-primary ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

export function AdminMembersTable({
  members,
  total,
  page,
  limit,
  sort,
  dir,
  onSort,
  onPage,
}: AdminMembersTableProps) {
  const t = useTranslations("dashboard.members");
  const router = useRouter();
  const totalPages = Math.ceil(total / limit);

  const displayName = (m: AdminMember) => {
    if (m.first_name || m.last_name) return `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim();
    return m.full_name ?? "—";
  };

  return (
    <div className="space-y-4">
      {/* Table — hidden on mobile, show cards instead */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                { key: null, label: t("memberNumber") },
                { key: null, label: t("name") },
                { key: null, label: t("email") },
                { key: null, label: t("phone") },
                { key: "created_at" as SortKey, label: t("signupDate") },
                { key: "current_points" as SortKey, label: t("currentPoints") },
                { key: "lifetime_points" as SortKey, label: t("lifetimePoints") },
                { key: null, label: t("totalOrders") },
                { key: null, label: t("totalSpent") },
              ].map(({ key, label }) => (
                <th
                  key={label}
                  onClick={() => key && onSort(key)}
                  className={`text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                    key ? "cursor-pointer hover:text-brown" : ""
                  }`}
                >
                  {label}
                  {key && <SortIcon active={sort === key} dir={dir} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">
                  {t("noMembers")}
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => router.push(`/dashboard/members/${m.id}`)}
                  className="border-b border-gray-50 hover:bg-cream cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-xs text-gray-600">{m.member_number ?? "—"}</td>
                  <td className="py-3 px-3 font-semibold text-brown">{displayName(m)}</td>
                  <td className="py-3 px-3 text-gray-500 max-w-[180px] truncate">{m.email}</td>
                  <td className="py-3 px-3 text-gray-500">{m.phone ?? "—"}</td>
                  <td className="py-3 px-3 text-gray-500">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-primary">{m.current_points.toLocaleString()}</td>
                  <td className="py-3 px-3 text-gray-500">{m.lifetime_points.toLocaleString()}</td>
                  <td className="py-3 px-3 text-gray-500">{m.total_orders}</td>
                  <td className="py-3 px-3 text-gray-500">${m.total_spent.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {members.length === 0 ? (
          <p className="text-center py-8 text-gray-400">{t("noMembers")}</p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              onClick={() => router.push(`/dashboard/members/${m.id}`)}
              className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-brown">{displayName(m)}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
                <span className="font-bold text-primary text-lg">{m.current_points.toLocaleString()} pts</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-mono">{m.member_number ?? "—"}</span>
                {m.phone && <span>{m.phone}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 0}
            className="text-sm font-semibold text-primary disabled:opacity-40 hover:underline"
          >
            {t("prev")}
          </button>
          <span className="text-xs text-gray-400">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="text-sm font-semibold text-primary disabled:opacity-40 hover:underline"
          >
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
