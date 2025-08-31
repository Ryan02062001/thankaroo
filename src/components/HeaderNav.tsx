// src/components/HeaderNav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Gift as GiftIcon,
  LogOut,
  Bell,
  FileText,
  Settings,
  User,
  Menu,
} from "lucide-react";

type Props = {
  isAuthed: boolean;
};

export default function HeaderNav({ isAuthed }: Props) {
  const [userOpen, setUserOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [lastListId, setLastListId] = React.useState<string | null>(null);

  const userRef = React.useRef<HTMLDivElement | null>(null);
  const mobileRef = React.useRef<HTMLDivElement | null>(null);

  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(t)) setMobileOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Read last selected list id from cookie on mount (client only)
  React.useEffect(() => {
    try {
      const m = document.cookie.match(/(?:^|; )thankaroo_last_list_id=([^;]+)/);
      setLastListId(m ? decodeURIComponent(m[1]) : null);
    } catch {
      setLastListId(null);
    }
  }, []);

  const baseTrigger =
    "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const mutedLink = `${baseTrigger} text-slate-600 hover:text-slate-800 hover:bg-slate-50`;
  
  const activeLink =
    "text-slate-900 bg-slate-50 ring-1 ring-slate-200";

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-50 w-full shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#A4D9C9] to-[#8ed0be] group-hover:from-[#8ed0be] group-hover:to-[#7ac1a8] transition-all duration-200">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#2d2d2d] group-hover:text-[#1a1a1a] transition-colors">
              Thankaroo
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
            {isAuthed ? (
              <nav aria-label="Primary">
                <ul className="flex items-center space-x-1">
                 

                  {/* Gift List (direct) */}
                  <li>
                    <Link
                      href="/giftlist"
                      className={`${mutedLink} ${isActive("/giftlist") ? activeLink : ""}`}
                      aria-current={isActive("/giftlist") ? "page" : undefined}
                    >
                      <GiftIcon className="w-4 h-4 mr-2" />
                      Gift List
                    </Link>
                  </li>

                  {/* Reminders (direct) */}
                  <li>
                    <Link
                      href={lastListId ? `/reminders?list=${encodeURIComponent(lastListId)}` : "/reminders"}
                      className={`${mutedLink} ${isActive("/reminders") ? activeLink : ""}`}
                      aria-current={isActive("/reminders") ? "page" : undefined}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Reminders
                    </Link>
                  </li>

                  {/* Pricing */}
                  <li>
                    <Link
                      href="/pricing"
                      className={`${mutedLink} ${isActive("/pricing") ? activeLink : ""}`}
                      aria-current={isActive("/pricing") ? "page" : undefined}
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </nav>
            ) : (
              <nav aria-label="Primary">
                <ul className="flex items-center">
                  <li>
                    <Link href="/pricing" className={mutedLink}>
                      Pricing
                    </Link>
                  </li>
                  <li aria-hidden className="w-px h-6 bg-slate-300 mx-3" />
                  <li>
                    <Link href="/signin" className={mutedLink}>
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="ml-2 bg-[#A8E6CF] text-[#1a1a1a] hover:bg-[#8ed0be] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Get Started
                    </Link>
                  </li>
                </ul>
              </nav>
            )}
          </div>

          {/* Right Side - User Menu */}
          <div className="hidden lg:flex items-center">
            {isAuthed ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  className="h-10 w-10 p-0 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center"
                  onClick={() => setUserOpen((v) => !v)}
                  aria-expanded={userOpen}
                  aria-label="Open user menu"
                >
                  <User className="h-5 w-5" />
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 p-3 shadow-lg border-0 bg-white/95 backdrop-blur-lg max-h-[80vh] rounded-md ring-1 ring-slate-200">
                    <div className="px-2 py-1.5 mb-3">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Link
                        href="/settings"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1"
                      >
                        <div className="p-2 rounded bg-slate-100 mr-3">
                          <Settings className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Settings</div>
                          <div className="text-xs text-slate-500">Preferences</div>
                        </div>
                      </Link>

                      <form method="POST" action="/api/stripe/create-portal-session" className="w-full">
                        <button
                          type="submit"
                          className="flex items-center w-full py-3 px-3 rounded-md hover:bg-slate-50 transition-colors text-left col-span-1"
                        >
                          <div className="p-2 rounded bg-slate-100 mr-3">
                            <FileText className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Billing</div>
                            <div className="text-xs text-slate-500">Invoices</div>
                          </div>
                        </button>
                      </form>
                    </div>

                    <div className="my-2 h-px bg-slate-200" />

                    <form method="POST" action="/auth/sign-out" className="w-full">
                      <button
                        type="submit"
                        className="flex items-center w-full py-3 px-3 rounded-md hover:bg-red-50 transition-colors text-left text-red-600 hover:text-red-700"
                      >
                        <div className="p-2 rounded bg-red-100 mr-3">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Sign out</div>
                          <div className="text-xs text-red-500">End session</div>
                        </div>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/signin" className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#A8E6CF] text-[#1a1a1a] hover:bg-[#8ed0be] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden" ref={mobileRef}>
            <button
              type="button"
              className="h-9 w-9 p-0 rounded-md hover:bg-slate-100 transition-colors flex items-center justify-center"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {mobileOpen && (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[22rem] p-3 shadow-lg border-0 bg-white/95 backdrop-blur-lg max-h-[80vh] rounded-md ring-1 ring-slate-200" role="dialog" aria-modal="true">
                {isAuthed ? (
                  <>
                    <div className="px-2 py-1.5 mb-3">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Navigation</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                    

                      <Link
                        href="/giftlist"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1"
                        aria-current={isActive("/giftlist") ? "page" : undefined}
                      >
                        <div className="p-2 rounded bg-[#FFF2E0] mr-3">
                          <GiftIcon className="w-4 h-4 text-[#5a3a1a]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Gift List</div>
                          <div className="text-xs text-slate-500">Track gifts</div>
                        </div>
                      </Link>

                      <Link
                        href="/reminders"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1"
                        aria-current={isActive("/reminders") ? "page" : undefined}
                      >
                        <div className="p-2 rounded bg-[#E6F0FF] mr-3">
                          <Bell className="w-4 h-4 text-[#1d3b6a]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Reminders</div>
                          <div className="text-xs text-slate-500">Schedules</div>
                        </div>
                      </Link>

                      <Link
                        href="/pricing"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1"
                        aria-current={isActive("/pricing") ? "page" : undefined}
                      >
                        <div className="p-2 rounded bg-slate-100 mr-3">
                          <FileText className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Pricing</div>
                          <div className="text-xs text-slate-500">Plans</div>
                        </div>
                      </Link>
                    </div>

                    <div className="my-2 h-px bg-slate-200" />

                    <div className="px-2 py-1.5 mb-3">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Link
                        href="/settings"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1"
                      >
                        <div className="p-2 rounded bg-slate-100 mr-3">
                          <Settings className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Settings</div>
                          <div className="text-xs text-slate-500">Preferences</div>
                        </div>
                      </Link>

                      <form method="POST" action="/api/stripe/create-portal-session" className="w-full">
                        <button
                          type="submit"
                          className="flex items-center w-full py-3 px-3 rounded-md hover:bg-slate-50 transition-colors text-left col-span-1"
                        >
                          <div className="p-2 rounded bg-slate-100 mr-3">
                            <FileText className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Billing</div>
                            <div className="text-xs text-slate-500">Invoices</div>
                          </div>
                        </button>
                      </form>
                    </div>

                    <div className="my-2 h-px bg-slate-200" />

                    <form method="POST" action="/auth/sign-out" className="w-full">
                      <button
                        type="submit"
                        className="flex items-center w-full py-3 px-3 rounded-md hover:bg-red-50 transition-colors text-left text-red-600 hover:text-red-700"
                      >
                        <div className="p-2 rounded bg-red-100 mr-3">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Sign out</div>
                          <div className="text-xs text-red-500">End session</div>
                        </div>
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-1.5 mb-2">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Menu</div>
                    </div>

                    <nav aria-label="Mobile">
                      <ul className="space-y-1">
                        <li>
                          <Link
                            href="/pricing"
                            className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors"
                            aria-current={isActive("/pricing") ? "page" : undefined}
                          >
                            <FileText className="w-4 h-4 text-slate-600 mr-3" />
                            <span className="text-sm">Pricing</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/signin"
                            className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-600 mr-3" />
                            <span className="text-sm">Sign in</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/signup"
                            className="flex items-center py-3 px-3 rounded-md bg-[#A8E6CF] text-[#1a1a1a] hover:bg-[#8ed0be] transition-colors"
                          >
                            <Heart className="w-4 h-4 text-[#1a1a1a] mr-3" />
                            <span className="text-sm font-medium">Get Started</span>
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
