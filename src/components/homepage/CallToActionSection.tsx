"use client"

import { ArrowRight, Sparkles, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FinalCTASection() {
  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-b from-[#F0FDFB] to-white">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#A8E6CF]/60 bg-[#E0FFF4]/60 px-4 py-1.5 text-sm text-[#2f9c79]">
          <Sparkles className="h-4 w-4" />
          Finish your list in days, not weeks
        </div>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Every gift remembered. <span className="text-[#2f9c79]">Every thank-you done.</span>
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          Track gifts, draft heartfelt notes, and see who’s been thanked, all in one place.
        </p>

        <div className="mt-6 max-w-md mx-auto">
          <Link href="/signup" aria-label="Start free in 20s" className="block">
            <Button className="h-16 w-full px-6 bg-[linear-gradient(135deg,#A8E6CF_0%,#D4F3E7_60%,#F7FFFC_120%)]
           hover:bg-[linear-gradient(135deg,#B6ECD8_0%,#E1F7EE_60%,#FFFFFF_120%)] text-[#1a1a1a] text-lg font-bold shadow-lg hover:shadow-xl">
              START FREE IN 20s <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="mt-2 text-xs text-gray-500">Free trial • No credit card required • One‑time upgrade • Privacy-first</div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[#2f9c79]">
          <Sparkles className="w-5 h-5" />
          <Heart className="w-5 h-5 text-[#8ed0be]" />
          <Sparkles className="w-5 h-5" />
        </div>
      </div>
    </section>
  )
}
