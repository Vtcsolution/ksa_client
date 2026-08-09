import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Server Component / Route Handler client. Reads the caller's session from
 * cookies (refreshed by proxy.ts on every request) — respects RLS as that user.
 *
 * Server Components can't write cookies (Next.js restriction), so `setAll`
 * failures there are expected and safe to swallow: proxy.ts is the one place
 * that actually persists a refreshed session back to the browser.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // called from a Server Component — proxy.ts handles session refresh instead
          }
        },
      },
    },
  );
}
