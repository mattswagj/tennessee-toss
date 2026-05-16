import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function cookieHandlers() {
  const cookieStore = cookies();
  return {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(
      cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
    ) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
        );
      } catch {
        // Ignore in Server Components where cookies are read-only
      }
    },
  };
}

/** Anon-key client — respects RLS with the requesting user's session */
export function createServerSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieHandlers() }
  );
}

/** Service-role client — bypasses RLS, for admin/server-only operations */
export function createAdminSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: cookieHandlers() }
  );
}
