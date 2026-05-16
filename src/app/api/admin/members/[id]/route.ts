import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

function isAdmin(email: string | null | undefined) {
  return !ADMIN_EMAIL || email === ADMIN_EMAIL;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userClient = createServerSupabase();
  const { data: { user } } = await userClient.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabase();
  const { id } = params;

  const [profileRes, ordersRes, transactionsRes, redemptionsRes] = await Promise.all([
    admin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single(),
    admin
      .from("orders")
      .select("id, created_at, status, total_amount, order_type, order_items(id, quantity, menu_items(name_en, name_es))")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("loyalty_transactions")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("redemptions")
      .select("*, rewards(name_en, name_es, points_required)")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (profileRes.error) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile:      profileRes.data,
    orders:       ordersRes.data ?? [],
    transactions: transactionsRes.data ?? [],
    redemptions:  redemptionsRes.data ?? [],
  });
}
