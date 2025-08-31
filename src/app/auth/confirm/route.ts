import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

function setCookiesOnResponse(
  res: NextResponse,
  cookiesToSet: { name: string; value: string; options: CookieOptions }[]
) {
  cookiesToSet.forEach(({ name, value, options }) => {
    res.cookies.set(name, value, options as CookieOptions);
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/giftlist";

  // Prepare to capture cookies and then apply to final redirect response
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            pendingCookies.push({ name, value, options: options as CookieOptions });
          });
        },
      },
    }
  );

  // 1) OAuth or magic link code exchange path
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const errorRes = NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent("Invalid or expired link")}`, request.url));
      setCookiesOnResponse(errorRes, pendingCookies);
      return errorRes;
    }
    // If this is a password recovery flow, send user to reset page after session is set
    if (type === "recovery") {
      const recoveryRes = NextResponse.redirect(
        new URL(`/auth/reset-password?next=${encodeURIComponent(next)}`, request.url)
      );
      setCookiesOnResponse(recoveryRes, pendingCookies);
      return recoveryRes;
    }
    const okRes = NextResponse.redirect(new URL(next, request.url));
    setCookiesOnResponse(okRes, pendingCookies);
    return okRes;
  }

  // 2) Email OTP path (signup, recovery, email_change)
  if (!token_hash || !type) {
    const errorRes = NextResponse.redirect(new URL("/signin?error=Missing%20confirmation%20parameters", request.url));
    setCookiesOnResponse(errorRes, pendingCookies);
    return errorRes;
  }

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    let errorMessage = "Invalid%20or%20expired%20confirmation%20link";
    if (error.message.toLowerCase().includes("expired")) {
      errorMessage = "Confirmation%20link%20has%20expired.%20Please%20request%20a%20new%20one";
    } else if (error.message.toLowerCase().includes("invalid")) {
      errorMessage = "Invalid%20confirmation%20link";
    } else if (error.message.toLowerCase().includes("already")) {
      errorMessage = "Email%20already%20confirmed.%20Please%20sign%20in";
    }
    const errorRes = NextResponse.redirect(new URL(`/signin?error=${errorMessage}`, request.url));
    setCookiesOnResponse(errorRes, pendingCookies);
    return errorRes;
  }

  // For recovery, require the user to set a new password immediately
  if (type === "recovery") {
    const recoveryRes = NextResponse.redirect(
      new URL(`/auth/reset-password?next=${encodeURIComponent(next)}`, request.url)
    );
    setCookiesOnResponse(recoveryRes, pendingCookies);
    return recoveryRes;
  }

  const okRes = NextResponse.redirect(new URL(next, request.url));
  setCookiesOnResponse(okRes, pendingCookies);
  return okRes;
}