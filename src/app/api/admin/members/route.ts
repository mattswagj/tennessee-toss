import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

function isAdmin(email: string | null | undefined) {
  return !ADMIN_EMAIL || email === ADMIN_EMAIL;
}

export async function GET(req: NextRequest) {
  const userClient = createServerSupabase();
  const { data: { user } } = await userClient.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page     = parseInt(searchParams.get("page")  ?? "0", 10);
  const limit    = parseInt(searchParams.get("limit") ?? "20", 10);
  const search   = searchParams.get("search") ?? "";
  const sortBy   = searchParams.get("sort")   ?? "created_at";
  const sortDir  = searchParams.get("dir")    ?? "desc";

  const admin = createAdminSupabase();

  let query = admin
    .from("profiles")
    .select("id, email, full_name, first_name, last_name, phone, member_number, created_at, current_points, lifetime_points", { count: "exact" })
    .range(page * limit, (page + 1) * limit - 1)
    .order(sortBy, { ascending: sortDir === "asc" });

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,full_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,member_number.ilike.%${search}%`
    );
  }

  const { data: profiles, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ members: [], total: count ?? 0 });
  }

  // Fetch order stats for these profiles
  const ids = profiles.map((p) => p.id);
  const { data: orders } = await admin
    .from("orders")
    .select("user_id, total_amount, status")
    .in("user_id", ids)
    .neq("status", "cancelled");

  const statsByUser: Record<string, { count: number; total: number }> = {};
  for (const o of orders ?? []) {
    if (!statsByUser[o.user_id]) statsByUser[o.user_id] = { count: 0, total: 0 };
    statsByUser[o.user_id].count++;
    statsByUser[o.user_id].total += o.total_amount ?? 0;
  }

  const members = profiles.map((p) => ({
    ...p,
    total_orders: statsByUser[p.id]?.count ?? 0,
    total_spent:  statsByUser[p.id]?.total ?? 0,
  }));

  return NextResponse.json({ members, total: count ?? 0 });
}
