"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Sparkles, Heart, Gift, Calendar } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Suspense, useEffect } from "react"

type Plan = {
  name: string
  tagline: string
  price: string
  priceNote?: string
  ctaLabel: string
  ctaHref: string
  mostPopular?: boolean
  oneTime?: boolean
  features: string[]
  ctaOnClick?: () => void
}

function PlanCard(p: Plan) {
  return (
    <Card
      className={[
        "flex flex-col rounded-3xl border-2 text-gray-900 bg-white shadow-xl",
        "w-full min-w-[16rem] sm:min-w-[20rem] max-w-[25rem]",
        p.mostPopular ? "border-emerald-400/60 ring-emerald-400/40" : "border-gray-200",
      ].join(" ")}
    >
      <CardHeader className="pt-6 pb-4 px-6 sm:pt-8 sm:pb-6 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-xl sm:text-2xl text-gray-900">{p.name}</CardTitle>
            <CardDescription className="mt-1 text-gray-600">{p.tagline}</CardDescription>
          </div>
          {p.mostPopular && (
            <Badge className="bg-[#E0FFF4] text-[#2f9c79] border border-[#A8E6CF] px-2 py-1 text-xs sm:text-sm whitespace-nowrap">
              Most popular
            </Badge>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="text-4xl sm:text-5xl font-bold text-gray-900">{p.price}</div>
          {p.priceNote && <div className="text-sm text-gray-500">{p.priceNote}</div>}
          {p.oneTime && (
            <div className="ml-0 sm:ml-2 text-xs rounded bg-gray-100 px-2 py-1 text-gray-600">One-time</div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-4 sm:px-8 sm:pb-6">
        <ul className="space-y-2">
          {p.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="mt-0.5 h-4 w-4 text-[#3EB489] shrink-0" />
              <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="mt-auto px-6 pb-6 sm:px-8">
        {p.ctaOnClick ? (
          <Button size="lg" className="w-full h-12 bg-[#3EB489] hover:bg-[#2d9970] text-white" onClick={p.ctaOnClick}>
            {p.ctaLabel}
          </Button>
        ) : (
          <Link href={p.ctaHref} className="w-full">
            <Button size="lg" className="w-full h-12 bg-[#3EB489] hover:bg-[#2d9970] text-white">
              {p.ctaLabel}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}

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
      "1 event",
      "Basic reminders",
      "20 AI draft notes",
      "No CSV export",
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
      "1 wedding, unlimited gifts",
      "Smart reminders that run for 12 months",
      "CSV import & export",
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
      "2 collaborator seats (roles)",
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
      "2 collaborator seats (roles)",
    ],
    ctaOnClick: () => startCheckout({ lookup_key: "pro_annual" }),
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#F0FDFB] via-white to-[#E0FFF4]/40">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E0FFF4]/50 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#A8E6CF]/30 rounded-full blur-3xl"></div>
          </div>

          <div className="container relative mx-auto px-4 py-12 sm:py-16 md:py-20">
            {success && (
              <div className="mx-auto mb-6 max-w-2xl rounded-md border border-[#A8E6CF]/60 bg-[#E0FFF4] p-4 text-[#2f9c79]">
                Subscription successful!
                {sessionId && (
                  <form method="POST" action="/api/stripe/create-portal-session" className="mt-3">
                    <input type="hidden" name="session_id" value={sessionId} />
                    <Button className="bg-[#3EB489] hover:bg-[#2d9970] text-white">Manage your billing</Button>
                  </form>
                )}
              </div>
            )}
            {canceled && (
              <div className="mx-auto mb-6 max-w-2xl rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                Checkout canceled — you can try again anytime.
              </div>
            )}

            <div className="mx-auto text-center space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E0FFF4] px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-[#2f9c79] border border-[#A8E6CF]/60">
                <Sparkles className="h-4 w-4" />
                Simple, honest pricing
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
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
              {/* Tabs changed to Pay once / Subscribe */}
              <Tabs defaultValue="pay-once" className="w-full">
                <TabsList className="mx-auto w-full max-w-[420px] rounded-full bg-white text-[#2f9c79] border border-[#A8E6CF]/60 p-1 flex">
                  <TabsTrigger
                    value="pay-once"
                    className="flex-1 rounded-full px-4 py-1.5 text-gray-700 data-[state=active]:bg-[#E0FFF4] data-[state=active]:text-[#2f9c79]"
                  >
                    Pay once
                  </TabsTrigger>
                  <TabsTrigger
                    value="subscribe"
                    className="flex-1 rounded-full px-4 py-1.5 text-gray-700 data-[state=active]:bg-[#E0FFF4] data-[state=active]:text-[#2f9c79]"
                  >
                    Subscribe
                  </TabsTrigger>
                </TabsList>

                {/* Pay once tab */}
                <TabsContent value="pay-once" className="mt-6 sm:mt-8">
                  <div className="mx-auto justify-items-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 w-fit gap-4 sm:gap-6">
                    <PlanCard {...free} />
                    <PlanCard {...weddingPass} />
                  </div>
                </TabsContent>

                {/* Subscribe tab */}
                <TabsContent value="subscribe" className="mt-6 sm:mt-8">
                  <div className="mx-auto justify-items-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <PlanCard {...free} />
                    <PlanCard {...proMonthly} />
                    <PlanCard {...proAnnual} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mx-auto mt-8 sm:mt-10 grid max-w-5xl grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm text-gray-700">
              <div className="rounded-lg border border-[#A8E6CF]/60 bg-white p-4">
                <div className="font-semibold text-gray-900">No credit card</div>
                Try it first, upgrade later.
              </div>
              <div className="rounded-lg border border-[#A8E6CF]/60 bg-white p-4">
                <div className="font-semibold text-gray-900">3‑month minimum (Monthly)</div>
                Cancel anytime after the minimum.
              </div>
              <div className="rounded-lg border border-[#A8E6CF]/60 bg-white p-4">
                <div className="font-semibold text-gray-900">Wedding Pass covers 12 months</div>
                Automations run for a full year.
              </div>
            </div>
          </div>
        </section>
      </main>
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
