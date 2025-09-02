"use client"

import { useSearchParams } from "next/navigation"
import { Sparkles, Heart, Gift, Calendar } from "lucide-react"
import { Suspense, useEffect } from "react"
import PricingTabs from "@/components/pricing/PricingTabs"
import HighlightsGrid from "@/components/pricing/HighlightsGrid"
import BillingStatusBanner from "@/components/pricing/BillingStatusBanner"
import type { Plan } from "@/components/pricing/PlanCard"

function PricingContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success") === "true"
  const canceled = searchParams.get("canceled") === "true"
  const sessionId = searchParams.get("session_id") || ""

  // Trigger a server-side sync immediately after returning from Stripe success
  useEffect(() => {
    if (success) {
      fetch("/api/stripe/backfill", { method: "POST" }).catch(() => {})
    }
  }, [success])

  async function startCheckout(payload: { lookup_key?: string; price_id?: string }) {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.status === 401) {
      const next = encodeURIComponent(`${window.location.pathname}${window.location.search}` || "/pricing")
      window.location.href = `/signin?next=${next}`
      return
    }
    const data = await res.json()
    if (data?.url) {
      window.location.href = data.url
    } else {
      alert(data?.error?.message || "Unable to start checkout")
    }
  }

  // === Plans (updated to the new model) ===

  const free: Plan = {
    name: "Free",
    tagline: "Try it out.",
    price: "$0",
    ctaLabel: "Start free",
    ctaHref: "/signup",
    features: [
      "Up to 50 gifts",
      "1 list",
      "20 AI draft notes",
      "Email support",
    ],
  }

  const weddingPass: Plan = {
    name: "Wedding Pass",
    tagline: "Everything for one wedding — 12 months. No subscription.",
    price: "$59",
    ctaLabel: "Get Wedding Pass",
    ctaHref: "#",
    oneTime: true,
    mostPopular: true,
    features: [
      "4 lists, unlimited gifts",
      "Smart reminders that run for 12 months",
      "1,000 AI thank‑you drafts (total)",
      "Priority email support",
    ],
    ctaOnClick: () => startCheckout({ lookup_key: "wedding_plan" }),
  }

  const proMonthly: Plan = {
    name: "Pro (All Events)",
    tagline: "For planners & power users.",
    price: "$24",
    priceNote: "/month • 3‑month minimum",
    ctaLabel: "Get Pro Monthly",
    ctaHref: "#",
    features: [
      "Unlimited events & gifts",
      "Advanced reminder schedules & automations",
      "Bulk import & export",
      "Calendar export (.ics)",
  
    ],
    ctaOnClick: () => startCheckout({ lookup_key: "pro_monthly" }),
  }

  const proAnnual: Plan = {
    name: "Pro Annual (All Events)",
    tagline: "Best value for planners.",
    price: "$144",
    priceNote: "/year (~$12/mo)",
    ctaLabel: "Get Pro Annual",
    ctaHref: "#",
    features: [
      "Unlimited events & gifts",
      "Advanced reminder schedules & automations",
      "Bulk import & export",
      "Calendar export (.ics)",
     
    ],
    ctaOnClick: () => startCheckout({ lookup_key: "pro_annual" }),
  }

  return (
    <div className="flex min-h-screen flex-col">
      <section aria-labelledby="pricing-heading" className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#F0FDFB] via-white to-[#E0FFF4]/40">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E0FFF4]/50 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#A8E6CF]/30 rounded-full blur-3xl"></div>
          </div>

          <div className="container relative mx-auto px-4 py-12 sm:py-16 md:py-20">
            <BillingStatusBanner success={success} canceled={canceled} sessionId={sessionId} />

            <div className="mx-auto text-center space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E0FFF4] px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-[#2f9c79] border border-[#A8E6CF]/60">
                <Sparkles className="h-4 w-4" />
                Simple, honest pricing
              </div>
              <h1 id="pricing-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Start free. Pick a one‑time pass or subscribe.
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                No credit card required. Wedding Pass covers 12 months. Pro monthly has a 3‑month minimum.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm sm:text-base text-gray-700">
                <div className="inline-flex items-center gap-2">
                  <Heart className="h-4 w-4 text-[#2f9c79] fill-current" />
                  <span>Loved by thousands of couples</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Gift className="h-4 w-4 text-[#2f9c79]" />
                  <span>Track gifts, send notes, stay on schedule</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#2f9c79]" />
                  <span>Wedding-ready in minutes</span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 sm:mt-10 lg:w-10/12 w-full">
              <PricingTabs free={free} weddingPass={weddingPass} proMonthly={proMonthly} proAnnual={proAnnual} />
            </div>

            <HighlightsGrid />
          </div>
        </section>
      </section>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingContent />
    </Suspense>
  )
}
