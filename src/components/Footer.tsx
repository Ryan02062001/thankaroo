"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background w-full">
      <div className="container mx-auto flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-[#2d2d2d]" />
          <span className="text-xl font-semibold tracking-tight">Thankaroo</span>
        </div>
        <nav className="flex gap-4 md:gap-6">
          <Link href="#" className="text-sm font-medium hover:underline">
            Privacy
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Terms
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Contact
          </Link>
        </nav>
        <div className="text-sm text-muted-foreground">
          © 2025 Thankaroo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
