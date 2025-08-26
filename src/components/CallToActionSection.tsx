import { ArrowRight, Heart, Play, Sparkles, Star, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FinalCTASection() {
  return (
    <section className="relative overflow-hidden py-24  bg-white">
    

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="relative rounded-3xl border border-[#A8E6CF]/40 bg-white/70 backdrop-blur-xl shadow-xl">
            <div className="absolute inset-0 rounded-3xl pointer-events-none [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#A8E6CF]/30 blur-2xl rounded-full"></div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#E0FFF4]/40 blur-3xl rounded-full"></div>
            </div>

            <div className="px-6 py-12 md:px-12 md:py-16 text-center">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#A8E6CF]/60 bg-[#E0FFF4]/60 px-4 py-1.5 text-sm text-[#2f9c79]">
                <Sparkles className="h-4 w-4" />
                <span>Finish your thank‑you list in days, not weeks</span>
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-[#3EB489]" />
                <Heart className="w-6 h-6 text-[#8ed0be]" />
                <Sparkles className="w-6 h-6 text-[#3EB489]" />
              </div>

              <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-gray-900 to-gray-700 bg-clip-text text-transparent p-2">
                Ready to never miss a thank‑you note again?
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of couples using Thankaroo to track gifts, draft heartfelt notes, and stay on top of gentle reminders — all in one place.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <Link href="/signup" className="w-full sm:w-auto" aria-label="Start your free trial">
                  <Button
                    size="lg"
                    className="h-12 px-6 bg-[#2f9c79] text-white hover:bg-[#39b184] shadow-md hover:shadow-lg transition-all w-full"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 border-[#A8E6CF] text-[#2f9c79] hover:bg-[#E0FFF4] hover:border-[#2f9c79] w-full sm:w-auto"
                  aria-label="See how it works"
                >
                  <Play className="mr-2 h-5 w-5" />
                  See how it works
                </Button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                30‑day free trial. No credit card required. Cancel anytime.
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#A8E6CF]/40">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 text-gray-900">
                    <Star className="h-5 w-5 text-[#3EB489]" />
                    <span className="text-2xl font-semibold">4.9</span>
                    <span className="text-gray-500">/ 5</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">Average rating</div>
                </div>
                <div className="px-6 py-4">
                  <div className="text-2xl font-semibold text-gray-900">10,000+</div>
                  <div className="mt-1 text-sm text-gray-600">Couples getting it done</div>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 text-gray-900">
                    <ShieldCheck className="h-5 w-5 text-[#3EB489]" />
                    <span className="text-2xl font-semibold">30 days</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">Free trial — risk‑free</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
