import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware helper to refresh auth cookies with Supabase.
 * Only refresh; do not protect routes here (use getUser in server components).
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabaseSessionCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-"));

  if (!supabaseUrl || !supabaseAnonKey || !hasSupabaseSessionCookie) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // NextResponse cookies API uses same signature
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );

  // This call revalidates/refreshes the session transparently.
  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch {
    return response;
  }

  return response;
}
