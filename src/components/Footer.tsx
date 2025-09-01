import Link from "next/link"
import { Heart } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-[#2d2d2d]" />
            <span className="text-xl font-semibold tracking-tight">Thankaroo</span>
          </div>

          <nav aria-label="Footer" className="flex items-center gap-6">
            <ul className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center">
              <li>
                <Link href="/giftlist" className="text-sm hover:underline">
                  Gift List
                </Link>
              </li>
              <li>
                <Link href="/reminders" className="text-sm hover:underline">
                  Reminders
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm hover:underline">
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>

          <div className="text-sm text-muted-foreground">
            © {currentYear} Thankaroo. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
