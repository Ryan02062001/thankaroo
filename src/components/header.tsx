"use server";

import { Heart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/lib/auth";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#A4D9C9] bg-[#fefefe] shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-[#A4D9C9]" />
          <span className="text-xl font-semibold tracking-tight text-[#2d2d2d]">
            Thankaroo
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-3">
          {data.user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm text-[#2d2d2d] hover:bg-[#A8E6CF]/25"
              >
                Dashboard
              </Link>
              <Link
                href="/giftlist"
                className="rounded-md px-3 py-2 text-sm text-[#2d2d2d] hover:bg-[#A8E6CF]/25"
              >
                Gift List
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-sm text-[#2d2d2d] underline hover:bg-[#A8E6CF]/25"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-md px-3 py-2 text-sm text-[#2d2d2d] hover:bg-[#A8E6CF]/25"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md px-3 py-2 text-sm text-[#2d2d2d] underline hover:bg-[#A8E6CF]/25"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
