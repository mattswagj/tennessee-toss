export interface LoyaltyProfile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  member_number: string | null;
  current_points: number;
  lifetime_points: number;
  preferred_language: string;
  created_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  type: "earned" | "redeemed" | "manual_adjustment";
  points: number;
  description: string | null;
  order_id: string | null;
  created_at: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  redemption_code: string;
  points_cost: number;
  status: "pending" | "used" | "expired" | "cancelled";
  created_at: string;
  used_at: string | null;
  used_by_admin: string | null;
  order_id: string | null;
  rewards?: {
    name_en: string;
    name_es: string;
    description_en: string | null;
    description_es: string | null;
    points_required: number;
  };
  profiles?: {
    email: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    member_number: string | null;
  };
}

export interface LoyaltyReward {
  id: string;
  name_en: string;
  name_es: string;
  description_en: string | null;
  description_es: string | null;
  points_required: number;
  is_active: boolean;
}

export const REWARD_TIERS = [
  { points: 500,  label_en: "Free Dressing / Side",  label_es: "Aderezo / Guarnición Gratis" },
  { points: 1000, label_en: "$5 Off Your Order",     label_es: "$5 de Descuento" },
  { points: 2000, label_en: "Free Salad",             label_es: "Ensalada Gratis" },
] as const;

export interface AdminMember {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  member_number: string | null;
  created_at: string;
  current_points: number;
  lifetime_points: number;
  total_orders: number;
  total_spent: number;
}
