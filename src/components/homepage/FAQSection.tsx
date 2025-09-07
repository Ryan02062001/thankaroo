"use client"

import { HelpCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FAQSection() {
  const faqs = [
    {
      q: "Is this faster than spreadsheets?",
      a: "Yes. Most couples set up in under a minute, log gifts in seconds, and let AI draft notes they can personalize. The tracker shows exactly who’s been thanked.",
    },
    {
      q: "Does Thankaroo work on mobile?",
      a: "Yes—it's fully responsive, so you can add gifts and manage notes from your phone, tablet, or desktop.",
    },
    {
      q: "Do we need a credit card to start?",
      a: "No. Start free without a card. Upgrade later only if you need more power.",
    },
  ] as const

  return (
    <section id="faq" className="bg-gradient-to-b from-white to-[#F0FDFB] py-16 md:py-24 scroll-mt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E0FFF4] px-4 py-2 text-sm font-medium text-[#2f9c79]">
            <HelpCircle className="w-4 h-4" />
            Frequently asked
          </div>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
            Everything you need to keep <span className="text-[#2f9c79]">every thank-you done</span>
          </h2>
        </div>

        <ul className="space-y-4">
          {faqs.map((f) => (
            <li key={f.q} className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold">{f.q}</h3>
              <p className="mt-2 text-gray-600">{f.a}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 max-w-md mx-auto text-center">
          <Link href="/signup" aria-label="Start free in 20s" className="block">
          <Button className="h-16 w-full px-6 bg-[linear-gradient(135deg,#5BBFA4_0%,#A7DBCE_60%,#D8F3EB_120%)]
           hover:bg-[linear-gradient(135deg,#6BC9AE_0%,#B9E6D9_60%,#E8FCF6_120%)] text-[#fefefe] text-lg font-bold shadow-lg hover:shadow-xl">
                  SIGN UP & START TRACKING FREE <HelpCircle className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Free trial • No credit card required • One‑time upgrade • Privacy-first</p>
        </div>
      </div>
    </section>
  )
}
