"use client"

import * as React from "react"
import Link from "next/link"
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
  cubicBezier,
} from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, Mail, CheckCircle2, Sparkles } from "lucide-react"

const easeOutExpo = cubicBezier(0.22, 1, 0.36, 1)

// One message + one path (frequency)
const CTA_LABEL = "START TRACKING FREE"
const CTA_HREF = "/signup"

// Keep your pleasing alternating layout,
// but make the motion a touch softer for mobile webviews.
const makeSideVariants = (dir: "left" | "right", reduced: boolean): Variants => {
  const dx = reduced ? 0 : dir === "left" ? -48 : 48
  const common = { scale: 1, filter: "blur(0px)" }
  return {
    hidden: { opacity: 0, x: dx, ...common },
    show:   { opacity: 1, x: 0,  ...common, transition: { duration: 0.7, ease: easeOutExpo } },
    hide:   { opacity: 0, x: dx, ...common, transition: { duration: 0.5, ease: easeOutExpo } },
  }
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.995 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.6, ease: easeOutExpo } },
}

type Step = {
  number: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  features: string[]
}

function StepRow({
  step,
  index,
  isLast,
}: {
  step: Step
  index: number
  isLast: boolean
}) {
  const prefersReduced = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.25, margin: "-12% 0px -12% 0px" })
  const reversed = index % 2 === 1

  const contentVariants = makeSideVariants(reversed ? "right" : "left", !!prefersReduced)
  const visualVariants  = makeSideVariants(reversed ? "left" : "right", !!prefersReduced)

  return (
    <div ref={ref} className="relative">
      {!isLast && (
        <motion.div
          variants={makeSideVariants("right", !!prefersReduced)}
          initial="hidden"
          animate={inView ? "show" : "hide"}
          className="hidden lg:block absolute left-1/2 top-28 w-px h-24 bg-gradient-to-b from-[#A8E6CF] to-[#E0FFF4] -translate-x-1/2 z-0"
        />
      )}

      <div className={`flex flex-col lg:flex-row items-center gap-12 mb-16 ${reversed ? "lg:flex-row-reverse" : ""}`}>
        {/* Copy side */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate={inView ? "show" : "hide"}
          className="flex-1 space-y-5"
        >
          <div className="flex items-center gap-4">
            <span className="text-6xl font-extrabold text-[#E0FFF4]">{step.number}</span>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3EB489] to-[#A8E6CF] grid place-items-center">
              <step.icon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold mb-3 text-gray-900">{step.title}</h3>
            <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>

            {/* Keep your pleasing badges, but cap to 3 for scannability */}
            <div className="mt-5 flex flex-wrap gap-3">
              {step.features.map((feature, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border border-[#A8E6CF] text-[#2f9c79] bg-[#E0FFF4]/40 px-3 py-1.5 text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Visual card side */}
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate={inView ? "show" : "hide"}
          className="w-full lg:flex-1 flex justify-center"
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-[#F0FDFB] w-full md:max-w-sm">
            <CardContent className="p-8">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#3EB489] to-[#A8E6CF] grid place-items-center">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-semibold text-lg text-gray-900">{step.title}</h4>
                <div className="space-y-2">
                  {step.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#3EB489]" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function HowItWorksSection() {
  const steps: Step[] = [
    {
      number: "01",
      icon: Gift,
      title: "Log gifts",
      description:
        "Capture gifts in one place, clear, tidy, and fast to update.",
      features: ["Quick entry", "Simple To Use", "Advanced Filters"],
    },
    {
      number: "02",
      icon: Mail,
      title: "Get beautiful drafts",
      description:
        "AI suggests heartfelt thank-you notes in your tone. Personalize in seconds.",
      features: ["Personal tone", "Gift-aware details", "One-tap edits"],
    },
    {
      number: "03",
      icon: CheckCircle2,
      title: "Track who’s been thanked",
      description:
        "Progress at a glance so nothing slips, never wonder “did we thank them?” again.",
      features: ["Status tracking", "Gentle reminders", "Zero duplicates"],
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-white to-[#F0FDFB] scroll-mt-24">
      {/* Header */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ amount: 0.3, once: true }}
        className="text-center max-w-3xl mx-auto mb-14 px-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#A8E6CF]/60 bg-[#E0FFF4]/60 px-4 py-1.5 text-sm text-[#2f9c79] mb-5">
          <Sparkles className="h-4 w-4" />
          How it works
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          From gifts → notes → <span className="text-[#2f9c79]">done</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-600">
          One simple flow that keeps every thank-you on track.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="max-w-6xl mx-auto px-4">
        {steps.map((step, index) => (
          <StepRow
            key={step.number}
            step={step}
            index={index}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>

      {/* Unified CTA (same label everywhere for frequency) */}
      <div className="mt-8 md:mt-10 text-center px-4">
        <div className="max-w-md mx-auto">
          <Link href={CTA_HREF} aria-label={CTA_LABEL} className="block">
            <Button className="h-16 w-full px-6 bg-[linear-gradient(135deg,#5BBFA4_0%,#A7DBCE_60%,#D8F3EB_120%)]
           hover:bg-[linear-gradient(135deg,#6BC9AE_0%,#B9E6D9_60%,#E8FCF6_120%)] text-[#fefefe] text-lg font-bold shadow-lg hover:shadow-xl">
              {CTA_LABEL} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Free trial • No credit card required • One‑time upgrade • Privacy-first</p>
        </div>
      </div>
    </section>
  )
}
