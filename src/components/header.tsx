import { Heart } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#A4D9C9] bg-[#fefefe] shadow-sm">
      <div className="max-w-7xl mx-auto flex h-20 items-center px-4">
        <div className="flex items-center gap-2">
          <Link className="flex items-center gap-2"href="/">
          <Heart className="h-6 w-6 text-[#A4D9C9]" />
          <span className="text-xl font-semibold tracking-tight text-[#2d2d2d]">
            Thankaroo
          </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

