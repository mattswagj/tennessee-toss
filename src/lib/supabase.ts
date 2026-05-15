import { createBrowserClient } from "@supabase/ssr";

export type MenuCategory = {
  id: string;
  name_en: string;
  name_es: string;
  slug: string;
  display_order: number;
  is_active: boolean;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name_en: string;
  name_es: string;
  description_en: string | null;
  description_es: string | null;
  price: number;
  image_url: string | null;
  calories: number | null;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
