import { type NextRequest } from "next/server";
import { updateSession } from "./src/utils/supabase/middleware";

/**
 * Refreshes Supabase auth cookies before Server Components run.
 * Do not put route protection here; do that with `supabase.auth.getUser()` in server components.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except static assets/images. Adjust as needed.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
