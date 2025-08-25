
import {
  Heart,
  LayoutDashboard,
  Gift as GiftIcon,
  LogOut,
  Bell,
  FileText,
  Settings,
  User,
  Menu
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-50 w-full shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
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
            {data.user ? (
              <>
                {/* Primary Navigation */}
                <NavigationMenu>
                  <NavigationMenuList className="space-x-1">
                    {/* Dashboard - Primary Action */}
                    <NavigationMenuItem>
                      <Link href="/dashboard" className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-[#A8E6CF]/10 text-[#1a1a1a] hover:bg-[#A8E6CF]/20 border border-[#A8E6CF]/30 font-medium"
                      )}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </NavigationMenuItem>

                    {/* Core Features Dropdown */}
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="data-[state=open]:bg-slate-50">
                        Features
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[30rem] p-2 content-start flex-wrap">
                          <div className="space-y-1 grid grid-cols-2 gap-2">
                            <NavigationMenuLink asChild>
                              <Link
                                href="/thankyou/notes"
                                className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group"
                              >
                                <div className="p-1.5 rounded bg-[#EAFBF3] text-[#1f4d3d] group-hover:bg-[#A8E6CF]">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">My Notes</div>
                                  <div className="text-xs text-muted-foreground">View all notes</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/thankyou"
                                className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group"
                              >
                                <div className="p-1.5 rounded bg-[#EAFBF3] text-[#1f4d3d] group-hover:bg-[#A8E6CF]">
                                  <Heart className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">Thank You Notes</div>
                                  <div className="text-xs text-muted-foreground">Write and manage notes</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/giftlist"
                                className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group"
                              >
                                <div className="p-1.5 rounded bg-[#FFF2E0] text-[#5a3a1a] group-hover:bg-[#FFD8A8]">
                                  <GiftIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">Gift List</div>
                                  <div className="text-xs text-muted-foreground">Track gifts and occasions</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link
                                href="/reminders"
                                className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors group"
                              >
                                <div className="p-1.5 rounded bg-[#E6F0FF] text-[#1d3b6a] group-hover:bg-[#B7D0FF]">
                                  <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">Reminders</div>
                                  <div className="text-xs text-muted-foreground">Set up reminder schedules</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Pricing */}
                    <NavigationMenuItem>
                      <Link
                        href="/pricing"
                        className={cn(navigationMenuTriggerStyle(), "text-slate-600 hover:text-slate-800")}
                      >
                        Pricing
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </>
            ) : (
              <>
                {/* Public Navigation */}
                <Link
                  href="/pricing"
                  className={cn(navigationMenuTriggerStyle(), "text-slate-600 hover:text-slate-800")}
                >
                  Pricing
                </Link>
                <div className="w-px h-6 bg-slate-300 mx-3" />
                <Link
                  href="/signin"
                  className={cn(navigationMenuTriggerStyle(), "text-slate-600 hover:text-slate-800")}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#A8E6CF] text-[#1a1a1a] hover:bg-[#8ed0be] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Right Side - User Menu */}
          <div className="hidden lg:flex items-center">
            {data.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-slate-100 transition-colors">
                    <User className="h-10 w-10" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-3 shadow-lg border-0 bg-white/95 backdrop-blur-lg">
                  <div className="px-2 py-1.5 mb-3">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1">
                        <div className="p-2 rounded bg-slate-100 mr-3">
                          <Settings className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Settings</div>
                          <div className="text-xs text-slate-500">Preferences</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <form method="POST" action="/api/stripe/create-portal-session" className="w-full">
                        <button type="submit" className="flex items-center w-full py-3 px-3 rounded-md hover:bg-slate-50 transition-colors text-left col-span-1">
                          <div className="p-2 rounded bg-slate-100 mr-3">
                            <FileText className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Billing</div>
                            <div className="text-xs text-slate-500">Invoices</div>
                          </div>
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild>
                    <form action="/api/auth/sign-out" className="w-full">
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
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/signin"
                  className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
                >
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

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            {data.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-3 shadow-lg border-0 bg-white/95 backdrop-blur-lg">
                  <div className="px-2 py-1.5 mb-3">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Navigation</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-2">
                        <div className="p-2 rounded bg-[#A8E6CF]/20 mr-3">
                          <LayoutDashboard className="w-4 h-4 text-[#1f4d3d]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Dashboard</div>
                          <div className="text-xs text-slate-500">Overview & analytics</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/thankyou/notes" className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1">
                        <div className="p-2 rounded bg-[#EAFBF3] mr-3">
                          <FileText className="w-4 h-4 text-[#1f4d3d]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">My Notes</div>
                          <div className="text-xs text-slate-500">View all</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/thankyou" className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1">
                        <div className="p-2 rounded bg-[#EAFBF3] mr-3">
                          <Heart className="w-4 h-4 text-[#1f4d3d]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Thank You</div>
                          <div className="text-xs text-slate-500">Manage notes</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/giftlist" className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1">
                        <div className="p-2 rounded bg-[#FFF2E0] mr-3">
                          <GiftIcon className="w-4 h-4 text-[#5a3a1a]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Gift List</div>
                          <div className="text-xs text-slate-500">Track gifts</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reminders" className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1">
                        <div className="p-2 rounded bg-[#E6F0FF] mr-3">
                          <Bell className="w-4 h-4 text-[#1d3b6a]" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Reminders</div>
                          <div className="text-xs text-slate-500">Schedules</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors col-span-1">
                        <div className="p-2 rounded bg-slate-100 mr-3">
                          <FileText className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Pricing</div>
                          <div className="text-xs text-slate-500">Plans</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <div className="px-2 py-1.5 mb-3">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center py-3 px-3 rounded-md hover:bg-accent transition-colors col-span-1">
                        <div className="p-2 rounded bg-muted mr-3">
                          <Settings className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Settings</div>
                          <div className="text-xs text-slate-500">Preferences</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <form method="POST" action="/api/stripe/create-portal-session" className="w-full">
                        <button type="submit" className="flex items-center w-full py-3 px-3 rounded-md hover:bg-accent transition-colors text-left col-span-1">
                          <div className="p-2 rounded bg-muted mr-3">
                            <FileText className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Billing</div>
                            <div className="text-xs text-slate-500">Invoices</div>
                          </div>
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild>
  <form method="POST" action="/api/auth/signout" className="w-full">
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
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-3 shadow-lg border-0 bg-white/95 backdrop-blur-lg">
                  <div className="px-2 py-1.5 mb-2">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Menu</div>
                  </div>
                  <div className="space-y-1">
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors">
                        <FileText className="w-4 h-4 text-slate-600 mr-3" />
                        <span className="text-sm">Pricing</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signin" className="flex items-center py-3 px-3 rounded-md hover:bg-slate-50 transition-colors">
                        <User className="w-4 h-4 text-slate-600 mr-3" />
                        <span className="text-sm">Sign in</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup" className="flex items-center py-3 px-3 rounded-md bg-[#A8E6CF] text-[#1a1a1a] hover:bg-[#8ed0be] transition-colors">
                        <Heart className="w-4 h-4 text-[#1a1a1a] mr-3" />
                        <span className="text-sm font-medium">Get Started</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
