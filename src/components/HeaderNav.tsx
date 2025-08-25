// src/components/HeaderNav.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
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
  const [featuresOpen, setFeaturesOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const featuresRef = React.useRef<HTMLDivElement | null>(null);
  const userRef = React.useRef<HTMLDivElement | null>(null);
  const mobileRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (featuresRef.current && !featuresRef.current.contains(t)) setFeaturesOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(t)) setMobileOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFeaturesOpen(false);
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

  const baseTrigger =
    "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const mutedLink = `${baseTrigger} text-slate-600 hover:text-slate-800`;
  const primaryTag =
    "bg-[#A8E6CF]/10 text-[#1a1a1a] hover:bg-[#A8E6CF]/20 border border-[#A8E6CF]/30 font-medium";

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-50 w-full shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 relative">
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
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            {isAuthed ? (
              <nav>
                <ul className="flex items-center space-x-1">
                  {/* Dashboard - Primary */}
                  <li>
                    <Link href="/dashboard" className={`${baseTrigger} ${primaryTag}`}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </li>

                  {/* Features Dropdown */}
                  <li>
                    <div
                      className="relative"
                      ref={featuresRef}
                      onMouseEnter={() => setFeaturesOpen(true)}
                      onMouseLeave={() => setFeaturesOpen(false)}
                    >
                      <button
                        type="button"
                        aria-expanded={featuresOpen}
                        className={`${baseTrigger} ${featuresOpen ? "bg-slate-50" : ""}`}
                        onClick={() => setFeaturesOpen((v) => !v)}
                      >
                        Features
                      </button>

                      {featuresOpen && (
                        <div className="absolute left-0 top-full mt-2 w-[30rem] p-2 bg-white rounded-md shadow-lg ring-1 ring-slate-200">
                          <div className="space-y-1 grid grid-cols-2 gap-2">
                            <Link
                              href="/thankyou/notes"
                              className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group"
                            >
                              <div className="p-1.5 rounded bg-[#EAFBF3] text-[#1f4d3d] group-hover:bg-[#A8E6CF]">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">My Notes</div>
                                <div className="text-xs text-slate-500">View all notes</div>
                              </div>
                            </Link>

                            <Link
                              href="/thankyou"
                              className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group"
                            >
                              <div className="p-1.5 rounded bg-[#EAFBF3] text-[#1f4d3d] group-hover:bg-[#A8E6CF]">
                                <Heart className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">Thank You Generator</div>
                                <div className="text-xs text-slate-500">Write and manage notes</div>
                              </div>
                            </Link>

                            <Link
                              href="/giftlist"
                              className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group"
                            >
                              <div className="p-1.5 rounded bg-[#FFF2E0] text-[#5a3a1a] group-hover:bg-[#FFD8A8]">
                                <GiftIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">Gift List</div>
                                <div className="text-xs text-slate-500">Track gifts and occasions</div>
                              </div>
                            </Link>

                            <Link
                              href="/reminders"
                              className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group"
                            >
                              <div className="p-1.5 rounded bg-[#E6F0FF] text-[#1d3b6a] group-hover:bg-[#B7D0FF]">
                                <Bell className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">Reminders</div>
                                <div className="text-xs text-slate-500">Set up reminder schedules</div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>

                  {/* Pricing */}
                  <li>
                    <Link href="/pricing" className={mutedLink}>
                      Pricing
                    </Link>
                  </li>
                </ul>
              </nav>
            ) : (
              <div className="flex items-center">
                <Link href="/pricing" className={mutedLink}>
                  Pricing
                </Link>
                <div className="w-px h-6 bg-slate-300 mx-3" />
                <Link href="/signin" className={mutedLink}>
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="ml-2 bg-[#A8E6CF] text-[#1a1a1a] hover:bg-[#8ed0be] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
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
                  <User className="h-10 w-10" />
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
              <div className="absolute right-0 top-full mt-2 w-80 p-3 shadow-lg border-0 bg-white/95 backdrop-blur-lg max-h-[80vh] rounded-md ring-1 ring-slate-200">
                {isAuthed ? (
                  <>
                    <div className="px-2 py-1.5 mb-3">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Navigation</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Link
                        href="/dashboard"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-2"
                      >
                        <div className="p-2 rounded bg-[#A8E6CF]/20 mr-3">
                          <LayoutDashboard className="w-4 h-4 text-[#1f4d3d]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Dashboard</div>
                          <div className="text-xs text-slate-500">Overview & analytics</div>
                        </div>
                      </Link>

                      <Link
                        href="/thankyou/notes"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1"
                      >
                        <div className="p-2 rounded bg-[#EAFBF3] mr-3">
                          <FileText className="w-4 h-4 text-[#1f4d3d]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">My Notes</div>
                          <div className="text-xs text-slate-500">View all</div>
                        </div>
                      </Link>

                      <Link
                        href="/thankyou"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1"
                      >
                        <div className="p-2 rounded bg-[#EAFBF3] mr-3">
                          <Heart className="w-4 h-4 text-[#1f4d3d]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Thank You</div>
                          <div className="text-xs text-slate-500">Manage notes</div>
                        </div>
                      </Link>

                      <Link
                        href="/giftlist"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1"
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

                    <div className="space-y-1">
                      <Link
                        href="/pricing"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-slate-600 mr-3" />
                        <span className="text-sm">Pricing</span>
                      </Link>

                      <Link
                        href="/signin"
                        className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-600 mr-3" />
                        <span className="text-sm">Sign in</span>
                      </Link>

                      <Link
                        href="/signup"
                        className="flex items-center py-3 px-3 rounded-md bg-[#A8E6CF] text-[#1a1a1a] hover:bg-[#8ed0be] transition-colors"
                      >
                        <Heart className="w-4 h-4 text-[#1a1a1a] mr-3" />
                        <span className="text-sm font-medium">Get Started</span>
                      </Link>
                    </div>
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