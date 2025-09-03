"use client"

import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  Heart,
  Sparkles,
  Clock,
} from "lucide-react"
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import HeroMockup from "./HeroMockup"

// Smoother/slower appear animations
const container: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1], // easeOut
      staggerChildren: 0.095,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

// Background hearts (two layers: distant & smaller visible)
function BackgroundHearts({ reduced }: { reduced: boolean }) {
  // Larger, subtle (farther back)
  const distant = [
    { pos: "top-10 left-6", size: 96, delay: 0.0, rotate: -6, baseOpacity: 0.10 },
    { pos: "top-20 right-10", size: 140, delay: 0.6, rotate: 4, baseOpacity: 0.10 },
    { pos: "top-1/2 left-[20%] -translate-y-1/2", size: 170, delay: 1.2, rotate: -3, baseOpacity: 0.10 },
    { pos: "bottom-24 left-10", size: 128, delay: 0.9, rotate: 2, baseOpacity: 0.10 },
    { pos: "bottom-12 right-8", size: 110, delay: 1.5, rotate: -5, baseOpacity: 0.10 },
    { pos: "top-[33%] right-1/4", size: 120, delay: 0.3, rotate: 3, baseOpacity: 0.10 },
  ] as const

  // Smaller, more visible (still background, just closer)
  const small = [
    { pos: "top-28 left-[12%]", size: 38, delay: 0.2, rotate: -8, color: "#3EB489", baseOpacity: 0.28 },
    { pos: "top-44 right-[18%]", size: 44, delay: 0.5, rotate: 6, color: "#3EB489", baseOpacity: 0.3 },
    { pos: "top-[60%] left-[8%]", size: 34, delay: 0.9, rotate: -4, color: "#3EB489", baseOpacity: 0.26 },
    { pos: "bottom-32 right-[14%]", size: 40, delay: 1.3, rotate: 8, color: "#3EB489", baseOpacity: 0.3 },
    { pos: "bottom-16 left-[18%]", size: 48, delay: 1.6, rotate: -6, color: "#3EB489", baseOpacity: 0.32 },
    { pos: "top-[22%] right-[8%]", size: 36, delay: 1.0, rotate: 5, color: "#3EB489", baseOpacity: 0.28 },
  ] as const

  return (
    <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
      {/* Distant layer */}
      {distant.map((h, i) => (
        <motion.div
          key={`d-${i}`}
          className={`absolute ${h.pos}`}
          style={{ rotate: h.rotate, opacity: h.baseOpacity }}
          animate={
            reduced ? undefined : { scale: [1, 1.08, 1], opacity: [h.baseOpacity, h.baseOpacity + 0.05, h.baseOpacity] }
          }
          transition={
            reduced ? undefined : { duration: 4.8 + (i % 3) * 0.6, repeat: Infinity, ease: [0.42, 0, 0.58, 1], delay: h.delay }
          }
        >
          <Heart width={h.size} height={h.size} className="text-[#A8E6CF] fill-current" />
        </motion.div>
      ))}

      {/* Smaller, more visible layer */}
      {small.map((h, i) => (
        <motion.div
          key={`s-${i}`}
          className={`absolute ${h.pos}`}
          style={{ rotate: h.rotate, opacity: h.baseOpacity }}
          animate={
            reduced ? undefined : { scale: [1, 1.18, 1], opacity: [h.baseOpacity, h.baseOpacity + 0.08, h.baseOpacity] }
          }
          transition={
            reduced ? undefined : { duration: 3.2 + (i % 3) * 0.4, repeat: Infinity, ease: [0.42, 0, 0.58, 1], delay: h.delay }
          }
        >
          <Heart width={h.size} height={h.size} style={{ color: h.color }} className="fill-current drop-shadow-sm" />
        </motion.div>
      ))}
    </div>
  )
}

export default function HeroSection() {
  const prefersReduced = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F0FDFB]">
      {/* Background hearts */}
      <BackgroundHearts reduced={!!prefersReduced} />

      <motion.div
        className="container relative mx-auto px-4 pt-16 md:pt-24 lg:pt-28 pb-32 md:pb-40 lg:pb-48 z-10"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
      >
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <motion.div className="flex items-center justify-center gap-2" variants={item}>
            <motion.div variants={item}>
              <Badge
                variant="secondary"
                className="bg-[#E0FFF4] text-[#3EB489] hover:bg-[#E0FFF4] border-[#A8E6CF]/50 px-4 py-2"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Gift Tracker
              </Badge>
            </motion.div>
            <motion.div variants={item}>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-orange-200 px-3 py-1 text-sm"
              >
                Thank-you Notes
              </Badge>
            </motion.div>
          </motion.div>

          <div className="space-y-6">
            {/* Headline (no underline/shimmer) */}
            <motion.h1
              variants={item}
              className="text-4xl font-bold tracking-tight sm:text-6xl md:text-6xl lg:text-7xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight"
            >
              Every gift remembered.
              <span className="block text-[#3EB489] relative">
              Every thank-you done.               <Heart className="absolute -top-2 -right-8 w-6 h-6 text-[#A8E6CF] fill-current animate-pulse" />
              </span>
            
            </motion.h1>

            <motion.p variants={item} className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Track wedding gifts and draft beautiful thank-you notes in minutes—so nothing slips. Don&apos;t be the couple that forgets!     </motion.p>
          </div>

          <motion.div
            variants={item}
            className="mx-auto max-w-xl flex items-center justify-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <Clock className="w-5 h-5 text-yellow-600" />
            <div className="text-sm">
              <span className="font-semibold text-yellow-800">Wedding season is here!</span>
              <span className="text-yellow-700 ml-1">Get started for free before the gift rush begins. Get set up in 20 seconds!</span>
            </div>
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center max-w-lg w-full mx-auto">
              <Link href="/signup" aria-label="Start free trial" className="w-full sm:w-1/2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    className="h-12 px-6 bg-[#2f9c79] hover:bg-[#258868] text-white shadow-lg hover:shadow-xl transition-all w-full"
                  >
                    Sign Up For Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>

             
            </div>
            <p className="text-sm text-gray-500">100% free. No credit card required.</p>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-gray-700 max-w-6xl mx-auto"
          >
            {[
              "Effortless gift tracking with smart lists",
              "AI-assisted thank-you notes",
              "Automatic reminders so nothing slips",
              "Everything in one easy to manage place",
            ].map((text, i) => (
              <motion.li
                key={text}
                className="flex items-start gap-2 text-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
              >
                <motion.span
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 360, damping: 26 }}
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 text-[#2f9c79] flex-shrink-0" aria-hidden />
                </motion.span>
                <span>{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* Interactive Mockup — gentle idle float */}
      <motion.div
        aria-hidden
        animate={prefersReduced ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
      >
        <HeroMockup />
      </motion.div>
    </section>
  )
}
