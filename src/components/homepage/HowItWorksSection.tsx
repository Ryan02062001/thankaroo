"use client"

import * as React from "react"
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
  cubicBezier,
} from "framer-motion"
import { ArrowRight, GiftIcon as Gift2, CheckCircle2, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/** Typed easing */
const easeOutExpo = cubicBezier(0.22, 1, 0.36, 1)

/** Variants (slower + softer) */
const makeSideVariants = (dir: "left" | "right", reduced: boolean): Variants => {
  const dx = reduced ? 0 : dir === "left" ? -56 : 56
  const common = { scale: reduced ? 1 : 0.985, filter: reduced ? "blur(0px)" : "blur(2px)" }
  return {
    hidden: { opacity: 0, x: dx, ...common },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: easeOutExpo }, // was ~0.6
    },
    hide: {
      opacity: 0,
      x: dx,
      scale: 0.985,
      filter: reduced ? "blur(0px)" : "blur(2px)",
      transition: { duration: 0.6, ease: easeOutExpo }, // was ~0.45
    },
  }
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.75, ease: easeOutExpo } },
  hide:   { opacity: 0, y: 24, scale: 0.985, transition: { duration: 0.55, ease: easeOutExpo } },
}

/** Types */
type Step = {
  number: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  features: string[]
}

/** Row */
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
  // Trigger a touch earlier, both directions
  const inView = useInView(ref, { amount: 0.25, margin: "-12% 0px -12% 0px" })
  const reversed = index % 2 === 1

  const contentVariants = makeSideVariants(reversed ? "right" : "left", !!prefersReduced)
  const visualVariants  = makeSideVariants(reversed ? "left" : "right", !!prefersReduced)

  // Slight stagger for cohesion (smoother perception)
  const baseDelay = prefersReduced ? 0 : 0.08

  return (
    <div ref={ref} className="relative">
      {/* Connector line */}
      {!isLast && (
        <motion.div
          variants={makeSideVariants("right", !!prefersReduced)}
          initial="hidden"
          animate={inView ? "show" : "hide"}
          transition={{ duration: 0.6 }}
          className="hidden lg:block absolute left-1/2 top-32 w-px h-32 bg-gradient-to-b from-[#A8E6CF] to-[#E0FFF4] -translate-x-1/2 z-0"
          style={{ willChange: "transform, opacity, filter" }}
        />
      )}

      <div className={`flex flex-col lg:flex-row items-center gap-12 mb-20 ${reversed ? "lg:flex-row-reverse" : ""}`}>
        {/* Content */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate={inView ? "show" : "hide"}
          transition={{ delay: baseDelay }}
          className="flex-1 space-y-6"
          style={{ willChange: "transform, opacity, filter" }}
        >
          <div className="flex items-center gap-4">
            <span className="text-6xl font-bold text-[#E0FFF4]">{step.number}</span>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3EB489] to-[#A8E6CF] flex items-center justify-center">
              <step.icon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold mb-4 text-gray-900">{step.title}</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">{step.description}</p>

            <div className="flex flex-wrap gap-3">
              {step.features.map((feature, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="border-[#A8E6CF] text-[#3EB489] bg-[#E0FFF4]/30"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate={inView ? "show" : "hide"}
          transition={{ delay: prefersReduced ? 0 : baseDelay + 0.06 }}
          className="flex-1 flex justify-center"
          style={{ willChange: "transform, opacity, filter" }}
        >
          <motion.div
            whileHover={prefersReduced ? undefined : { y: -3, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{ willChange: "transform" }}
            className="w-full max-w-sm"
          >
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-[#F0FDFB]">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#3EB489] to-[#A8E6CF] flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">{step.title}</h4>
                  <div className="space-y-2">
                    {step.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#3EB489]" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

/** Section */
export default function HowItWorksSection() {
  const steps: Step[] = [
    {
      number: "01",
      icon: Gift2,
      title: "Log Your Gifts",
      description:
        "Quickly capture gift details as you receive them. Add notes and set reminders with our streamlined interface.",
      features: ["Quick entry form", "Set Reminders", "Guest details"],
    },
    {
      number: "02",
      icon: Sparkles, // or keep PenTool
      title: "Write Thank-You Notes with AI",
      description:
        "Let AI draft thoughtful thank-you messages automatically, then add your personal touch before sending.",
      features: ["AI-drafted messages", "Smart personalization", "Quick edit & send"],
    },
    {
      number: "03",
      icon: CheckCircle2,
      title: "Track & Complete",
      description:
        "Mark notes as sent and track your progress. Never worry about forgetting someone or sending duplicate thank-yous.",
      features: ["Progress tracking", "Completion status", "Reminder system"],
    },
  ]

  return (
    <section className="py-20 md:py-32 white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0FDFB]/30 via-transparent to-[#E0FFF4]/20" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.35, once: false }}
          className="text-center max-w-3xl mx-auto mb-20"
          style={{ willChange: "transform, opacity" }}
        >
          <Badge
            variant="secondary"
            className="bg-[#E0FFF4] text-[#3EB489] hover:bg-[#E0FFF4] border-[#A8E6CF]/50 mb-6"
          >
            🎯 How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Three simple steps to
            <span className="block text-[#3EB489]">thank-you success</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Our streamlined process makes managing wedding thank-yous feel effortless and enjoyable.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <StepRow
              key={step.number}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.3, once: false }}
          className="text-center"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="inline-flex items-center gap-2 text-[#3EB489] font-semibold">
            <span>Ready to get started?</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
