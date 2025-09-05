"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle, Heart, Sparkles, Clock } from "lucide-react"
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
            <Badge className="bg-orange-100 text-orange-600 border-orange-200 px-3 py-1 text-sm">
              Thank-you Notes
            </Badge>
          </motion.div>

          {/* ONE big idea repeated */}
          <div className="space-y-6">
            <motion.h1
              variants={item}
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight"
            >
              Every gift remembered.
              <span className="block text-[#2f9c79] relative">
                Every thank-you done.
                <Heart className="absolute -top-2 -right-8 w-6 h-6 text-[#A8E6CF] fill-current" />
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-md md:text-xl text-gray-600 leading-relaxed">
              Track wedding gifts and draft beautiful thank-you notes in minutes so nothing slips.
            </motion.p>
       
          </div>

          {/* urgency bar */}
          <motion.div
            variants={item}
            className="mx-auto max-w-xl flex items-center justify-center gap-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <Clock className="w-5 h-5 text-yellow-600" />
            <div className="text-sm">
              <span className="font-semibold text-yellow-800">Wedding season is here!</span>
              <span className="text-yellow-700 ml-1">Set up your tracker in ~20 seconds.</span>
            </div>
          </motion.div>

          {/* single CTA only */}
          <motion.div variants={item} className="space-y-3">
            <div className="max-w-md w-full mx-auto">
              <Badge className="bg-[#E0FFF4] text-[#2f9c79] border-[#A8E6CF]/60 px-4 py-1.5 text-sm whitespace-normal break-words w-full sm:w-auto text-center">
                New & growing — built with engaged couples in private beta. Now open to all.
              </Badge>
            </div>
            <div className="max-w-md w-full mx-auto">
              <Link href="/signup" aria-label="Start free in 20s" className="block">
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-md h-12 w-full px-6 bg-[linear-gradient(135deg,#2f9c79_0%,#39b184_60%,#E6FFF7_120%)]
           hover:bg-[linear-gradient(135deg,#39b184_0%,#51caa0_60%,#F7FFFC_120%)] text-white shadow-lg hover:shadow-xl"
                >
                  Start free in 20s
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

      {/* subtle product peek */}
      <motion.div
        aria-hidden
        animate={prefersReduced ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
      >
      
      </motion.div>
    </section>
  )
}
