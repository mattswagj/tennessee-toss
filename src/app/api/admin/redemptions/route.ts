import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

function isAdmin(email: string | null | undefined) {
  return !ADMIN_EMAIL || email === ADMIN_EMAIL;
}

export async function GET() {
  const userClient = createServerSupabase();
  const { data: { user } } = await userClient.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabase();

  const { data, error } = await admin
    .from("redemptions")
    .select(`
      *,
      rewards(name_en, name_es, points_required),
      profiles(email, full_name, first_name, last_name, member_number)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ redemptions: data ?? [] });
}

// Lookup by phone / member_number / name (for cashier lookup page)
export async function POST(req: NextRequest) {
  const userClient = createServerSupabase();
  const { data: { user } } = await userClient.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query: q } = await req.json();
  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return NextResponse.json({ member: null });
  }

  const search = q.trim();
  const admin = createAdminSupabase();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, full_name, first_name, last_name, phone, member_number, current_points, lifetime_points")
    .or(
      `member_number.ilike.%${search}%,phone.ilike.%${search}%,full_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    )
    .limit(1);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ member: null });
  }

  const profile = profiles[0];

  const { data: redemptions } = await admin
    .from("redemptions")
    .select("*, rewards(name_en, name_es)")
    .eq("user_id", profile.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return NextResponse.json({ member: profile, redemptions: redemptions ?? [] });
}
