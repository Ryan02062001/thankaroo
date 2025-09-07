"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle, Heart, Sparkles } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


const container: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.095 },
  },
}
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function HeroSection() {
  const prefersReduced = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F0FDFB]">
      <motion.div
        className="container relative mx-auto px-4 pt-5 md:pt-24 lg:pt-28 pb-20 md:pb-28 z-10"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
      >
        <div className="mx-auto max-w-4xl text-center space-y-6">
          {/* non-clickable labels; no nav/options */}
          <motion.div className="hidden md:flex items-center justify-center gap-2" variants={item}>
            <Badge className="bg-[#E0FFF4] text-[#3EB489] border-[#A8E6CF]/50 px-4 py-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Gift Tracker
            </Badge>
            <Badge className="bg-[#E0FFF4] text-[#3EB489] border-[#A8E6CF]/50 px-3 py-1 text-sm">
              Thank-you Notes
            </Badge>
          </motion.div>

          {/* ONE big idea repeated */}
          <div className="space-y-6">
            <motion.h1
              variants={item}
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight"
            >
              
              Track Every Gift &
              <span className="block text-[#A8E6CF] relative">
              Generate Thank-Yous In Seconds
                <Heart className="absolute -top-2 -right-8 w-6 h-6 text-[#A8E6CF] fill-current" />
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-md md:text-xl text-gray-600 leading-relaxed">
            Stop spreadsheets. Remember every gift. Generate ai assisted thank-yous. Quicker than ever before.
                        </motion.p>
       
          </div>

          {/* urgency bar */}
          {/* <motion.div
            variants={item}
            className="mx-auto max-w-xl flex items-center justify-center gap-4 p-2 bg-[#E0FFF4] border border-[#A8E6CF] rounded-lg"
          >
            <Clock className="w-5 h-5 text-[#2f9c79]" />
            <div className="text-sm">
              <span className="font-semibold text-[#2f9c79]">Wedding season is here!</span>
              <span className="text-[#2f9c79] ml-1">Set up your tracker in ~20 seconds.</span>
            </div>
          </motion.div> */}

          {/* single CTA only */}
          <motion.div variants={item} className="space-y-3">
            <div className="max-w-md w-full mx-auto font-bold text-sm">
                New & growing — built with engaged couples in private beta. Now open to all.
            </div>
            <div className="max-w-md w-full mx-auto">
             <Link href="/signup" aria-label="Start free in 20s" className="block">
                <Button className="h-16 w-full px-6 bg-[linear-gradient(135deg,#A8E6CF_0%,#D4F3E7_60%,#F7FFFC_120%)]
           hover:bg-[linear-gradient(135deg,#B6ECD8_0%,#E1F7EE_60%,#FFFFFF_120%)] text-[#1a1a1a] text-lg font-bold shadow-lg hover:shadow-xl">
                  START FREE IN 20s
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="max-w-md w-full mx-auto text-center">
              <p className="text-sm text-gray-500">Free trial • No credit card required • One‑time upgrade • Privacy-first</p>
            </div>
          </motion.div>

          {/* three tight support points */}
          <motion.ul variants={item} className="mt-2 grid gap-4 sm:grid-cols-3 text-gray-700 max-w-4xl mx-auto">
            {[
              "Log gifts in seconds, no spreadsheet",
              "AI-drafted thank-yous to personalize",
              "Clear tracking so no one’s missed",
            ].map((text, i) => (
              <motion.li
                key={text}
                className="flex items-center justify-center gap-2 text-center text-sm"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
              >
                <CheckCircle className="h-4 w-4 text-[#2f9c79]" aria-hidden />
                <span>{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* subtle floating hearts */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Center, behind content - very subtle */}
        <motion.span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#E0FFF4]"
          animate={prefersReduced ? {} : { scale: [1, 1.05, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-28 h-28 fill-current" />
        </motion.span>

        {/* Slightly offset from center */}
        <motion.span
          className="absolute left-[62%] top-[46%] -translate-x-1/2 -translate-y-1/2 text-[#A8E6CF]"
          animate={prefersReduced ? {} : { scale: [1, 1.07, 1], opacity: [0.07, 0.14, 0.07] }}
          transition={{ duration: 3.6, repeat: Infinity, delay: 0.6, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-20 h-20 fill-current" />
        </motion.span>

        <motion.span
          className="absolute top-8 left-6 text-[#A8E6CF]"
          animate={prefersReduced ? {} : { scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-8 h-8 fill-current" />
        </motion.span>

        <motion.span
          className="absolute top-24 right-10 text-[#E0FFF4]"
          animate={prefersReduced ? {} : { scale: [1, 1.08, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 3.0, repeat: Infinity, delay: 0.5, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-12 h-12 fill-current" />
        </motion.span>

        <motion.span
          className="absolute bottom-24 left-20 text-[#8ed0be]"
          animate={prefersReduced ? {} : { scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 3.4, repeat: Infinity, delay: 0.9, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-6 h-6 fill-current" />
        </motion.span>

        <motion.span
          className="absolute bottom-10 right-24 text-[#A8E6CF]"
          animate={prefersReduced ? {} : { scale: [1, 1.1, 1], opacity: [0.14, 0.24, 0.14] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 1.2, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-10 h-10 fill-current" />
        </motion.span>

        {/* Additional gentle hearts */}
        <motion.span
          className="absolute left-[22%] top-[30%] text-[#E0FFF4]"
          animate={prefersReduced ? {} : { scale: [1, 1.09, 1], opacity: [0.07, 0.13, 0.07] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: 0.4, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-12 h-12 fill-current" />
        </motion.span>

        <motion.span
          className="absolute right-[18%] top-[32%] text-[#8ed0be]"
          animate={prefersReduced ? {} : { scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 3.0, repeat: Infinity, delay: 0.8, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-11 h-11 fill-current" />
        </motion.span>

        <motion.span
          className="absolute left-[28%] bottom-[22%] text-[#A8E6CF]"
          animate={prefersReduced ? {} : { scale: [1, 1.08, 1], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 3.6, repeat: Infinity, delay: 1.1, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-10 h-10 fill-current" />
        </motion.span>

        <motion.span
          className="absolute right-[26%] bottom-[18%] text-[#E0FFF4]"
          animate={prefersReduced ? {} : { scale: [1, 1.06, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 3.8, repeat: Infinity, delay: 1.4, ease: [0.42, 0, 0.58, 1] }}
        >
          <Heart className="w-12 h-12 fill-current" />
        </motion.span>
      </div>
    </section>
  )
}
