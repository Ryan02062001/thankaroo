import Link from "next/link"
import { Heart } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-[#2d2d2d]" />
            <span className="text-xl font-semibold tracking-tight">Thankaroo</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm hover:underline">
              Dashboard
            </Link>
            <Link href="/thankyou" className="text-sm hover:underline">
              Thank Yous
            </Link>
            <Link href="/giftlist" className="text-sm hover:underline">
              Gift List
            </Link>
            <Link href="/reminders" className="text-sm hover:underline">
              Reminders
            </Link>
            <Link href="/pricing" className="text-sm hover:underline">
              Pricing
            </Link>
          </nav>

          <div className="text-sm text-muted-foreground">
            © {currentYear} Thankaroo. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
