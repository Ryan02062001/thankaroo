import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./src/utils/supabase/middleware";

/**
 * Refreshes Supabase auth cookies before Server Components run.
 * Do not put route protection here; do that with `supabase.auth.getUser()` in server components.
 */
export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const isConfirmPath = url.pathname.startsWith("/auth/confirm");
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  // If Supabase sent us back with a code or token_hash to any route,
  // forward to our unified confirm handler to exchange/verify and set cookies.
  if (!isConfirmPath && (code || tokenHash)) {
    const nextParam = url.searchParams.get("next") ?? "/giftlist";
    const redirectUrl = new URL("/auth/confirm", url.origin);
    if (code) redirectUrl.searchParams.set("code", code);
    if (tokenHash) redirectUrl.searchParams.set("token_hash", tokenHash);
    if (type) redirectUrl.searchParams.set("type", type);
    redirectUrl.searchParams.set("next", nextParam);
    return NextResponse.redirect(redirectUrl);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except static assets/images. Adjust as needed.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
