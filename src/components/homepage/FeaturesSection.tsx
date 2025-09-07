"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Gift,
  Mail,
  Calendar,
  Heart,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion"

type Feature = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  bullets: string[]
  color: string // tailwind gradient string
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  hide: { opacity: 0, y: 24, scale: 0.98, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  hide: {
    opacity: 0,
    y: 28,
    scale: 0.98,
    filter: "blur(2px)",
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

function FeatureCard({
  f,
  index,
  prefersReduced,
}: {
  f: Feature
  index: number
  prefersReduced: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.2 }) // trigger a bit early

  // Slight stagger per index
  const delay = prefersReduced ? 0 : index * 0.06

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "show" : "hide"}
      transition={{ delay }}
      className="h-full"
    >
      <motion.div
        whileHover={prefersReduced ? undefined : { y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="h-full"
        style={{ willChange: "transform, opacity, filter" }}
      >
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow h-full">
          <CardContent className="p-7 flex h-full flex-col">
            <motion.div
              // Icon gets a gentle float when card is hovered (handled by parent whileHover)
              animate={prefersReduced ? undefined : { rotate: 0 }}
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}
            >
              <f.icon className="w-7 h-7 text-white" />
            </motion.div>

            <h3 className="text-xl font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-gray-600">{f.description}</p>

            <ul className="mt-4 space-y-2">
              {f.bullets.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-[#3EB489]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-5" />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const prefersReduced = useReducedMotion()

  const features: Feature[] = [
    {
      icon: Gift,
      title: "Never lose track of gifts",
      description: "Smart tracking with lists and tags so everything stays organized.",
      bullets: ["Log gifts in seconds", "Filter by type or event", "See totals at a glance"],
      color: "from-[#3EB489] to-[#A8E6CF]",
    },
    {
      icon: Mail,
      title: "Send thank-you notes faster",
      description: "Know exactly who’s been thanked and what’s still pending.",
      bullets: ["Track who’s thanked", "One-click mark as sent", "Draft notes instantly"],
      color: "from-[#A8E6CF] to-[#E0FFF4]",
    },
    {
      icon: Calendar,
      title: "Stay on schedule effortlessly",
      description: "A simple timeline keeps you moving without last-minute stress.",
      bullets: ["Sort by date & priority", "Automatic reminders", "Clear weekly focus"],
      color: "from-[#E0FFF4] to-[#3EB489]",
    },
    {
      icon: Users,
      title: "All guests, one beautiful view",
      description: "See each guest and their gifts in a single, searchable place.",
      bullets: ["Link gifts to guests", "Fast search & filters", "Notes for every contact"],
      color: "from-[#3EB489] to-[#A8E6CF]",
    },
    {
      icon: Heart,
      title: "Personal notes that shine",
      description: "Make every message heartfelt with saved details and templates.",
      bullets: ["Save personal details", "AI-assisted note ideas", "Templates in your voice"],
      color: "from-[#A8E6CF] to-[#E0FFF4]",
    },
    {
      icon: Calendar,
      title: "Calendar export (.ics)",
      description: "Send upcoming reminders straight to your calendar.",
      bullets: ["Export due dates", "Works with Google/Apple/Outlook", "One‑click download"],
      color: "from-[#E0FFF4] to-[#3EB489]",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-[#F0FDFB] to-white scroll-mt-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.3, once: false }}
          className="text-center max-w-3xl mx-auto mb-14"
          style={{ willChange: "transform, opacity" }}
        >
          <Badge
            variant="secondary"
            className="bg-[#E0FFF4] text-[#3EB489] border-[#A8E6CF]/50 mb-6"
          >
            ✨ Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Everything you need for
            <span className="block text-[#3EB489]">perfect thank-you notes</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Designed for clarity and speed — scannable features with real benefits so you can
            track gifts and send notes without the overwhelm. Early users say Thankaroo made finishing thank‑you notes way faster.

          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} index={i} prefersReduced={!!prefersReduced} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.25, once: false }}
          className="mt-14 flex flex-col items-center gap-3 "
          style={{ willChange: "transform, opacity" }}
        >
          <div className="mt-6 max-w-md w-full mx-auto">
          <Link href="/signup" aria-label="Start free in 20s" className="block">
          <Button className="h-16 w-full px-6 bg-[linear-gradient(135deg,#5BBFA4_0%,#A7DBCE_60%,#D8F3EB_120%)]
           hover:bg-[linear-gradient(135deg,#6BC9AE_0%,#B9E6D9_60%,#E8FCF6_120%)] text-[#fefefe] text-lg font-bold shadow-lg hover:shadow-xl">
                  START TRACKING FREE <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="mt-2 text-xs text-gray-500 text-center">Free trial • No credit card required • One‑time upgrade • Privacy-first</div>
        </div>
        </motion.div>
      </div>
    </section>
  )
}
