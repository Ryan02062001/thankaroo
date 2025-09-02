import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/app/types/database";

/**
 * Next.js 15 + Supabase SSR cookie adapter
 * - In Server Components, Next forbids cookie writes.
 * - We still pass setAll, but wrap it in try/catch so it no-ops there.
 * - In Server Actions / Route Handlers (where writes are allowed),
 *   cookieStore.set will succeed and persist the session.
 */
export async function createClient() {
  const cookieStore = await cookies(); // Next 15 returns a Promise

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Supabase reads auth cookies with this
        getAll() {
          return cookieStore.getAll();
        },
        // Supabase writes/refreshes auth cookies with this
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // We're in a Server Component. Next.js forbids writes here.
            // This is expected. Cookies will be updated on the next
            // Server Action or Route Handler call.
          }
        },
      },
    }
  );
}
