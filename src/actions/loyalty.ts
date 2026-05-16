"use server";

import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function makeCode(len = 6) {
  return Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * 36)]).join("");
}

async function getSessionUser() {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

function assertAdmin(email: string | undefined | null) {
  if (ADMIN_EMAIL && email !== ADMIN_EMAIL) throw new Error("Unauthorized");
}

// ── Customer: redeem a reward ─────────────────────────────────────────

export async function redeemReward(
  rewardId: string
): Promise<{ code: string; redemptionId: string } | { error: string }> {
  try {
    const user = await getSessionUser();
    if (!user) return { error: "Not authenticated" };

    const supabase = createServerSupabase();

    const { data: reward, error: rErr } = await supabase
      .from("rewards")
      .select("id, points_required, name_en")
      .eq("id", rewardId)
      .eq("is_active", true)
      .single();

    if (rErr || !reward) return { error: "Reward not found" };

    // Deduct points via DB function (raises exception if insufficient)
    const { error: spendErr } = await supabase.rpc("spend_points", {
      p_user_id: user.id,
      p_amount: reward.points_required,
      p_description: `Redeemed: ${reward.name_en}`,
    });

    if (spendErr) {
      if (spendErr.message.includes("Insufficient")) return { error: "Not enough points" };
      return { error: spendErr.message };
    }

    const code = makeCode(6);
    const { data: redemption, error: insErr } = await supabase
      .from("redemptions")
      .insert({
        user_id: user.id,
        reward_id: rewardId,
        redemption_code: code,
        points_cost: reward.points_required,
        status: "pending",
      })
      .select("id")
      .single();

    if (insErr || !redemption) return { error: "Failed to create redemption" };

    return { code, redemptionId: redemption.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Admin: mark redemption as used ───────────────────────────────────

export async function markRedemptionUsed(
  redemptionId: string
): Promise<{ error?: string }> {
  try {
    const user = await getSessionUser();
    assertAdmin(user?.email);

    const admin = createAdminSupabase();
    const { error } = await admin
      .from("redemptions")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
        used_by_admin: user!.email,
      })
      .eq("id", redemptionId)
      .eq("status", "pending");

    if (error) return { error: error.message };
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Admin: adjust member points manually ─────────────────────────────

export async function adjustPoints(
  userId: string,
  amount: number,
  reason: string
): Promise<{ error?: string }> {
  try {
    const user = await getSessionUser();
    assertAdmin(user?.email);

    const admin = createAdminSupabase();

    const { data: profile, error: fetchErr } = await admin
      .from("profiles")
      .select("current_points, lifetime_points")
      .eq("id", userId)
      .single();

    if (fetchErr || !profile) return { error: "User not found" };

    const newCurrent = profile.current_points + amount;
    if (newCurrent < 0) return { error: "Would result in negative points" };

    const newLifetime =
      amount > 0 ? profile.lifetime_points + amount : profile.lifetime_points;

    const { error: updateErr } = await admin
      .from("profiles")
      .update({ current_points: newCurrent, lifetime_points: newLifetime })
      .eq("id", userId);

    if (updateErr) return { error: updateErr.message };

    const { error: txErr } = await admin.from("loyalty_transactions").insert({
      user_id: userId,
      type: "manual_adjustment",
      points: amount,
      description: `Manual adjustment by ${user!.email}: ${reason}`,
    });

    if (txErr) return { error: txErr.message };

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
