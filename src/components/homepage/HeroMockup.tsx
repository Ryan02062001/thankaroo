// /Users/ryancooper/thankaroo/src/components/HeroMockup.tsx
"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Safari } from "@/components/magicui/safari"

interface HeroMockupProps {
  image?: string
  alt?: string // kept for API compatibility; Safari doesn’t use it by default
  url?: string
}

/**
 * Minimal hero mockup (desktop only):
 * - Single centered frame (GiftHub)
 * - Wider on large screens
 * - Scroll-driven fade-in + slight lift
 */
export default function HeroMockup({ image, url }: HeroMockupProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  // Fade from ~0.55 -> 1 and lift from 12px -> 0px as the mockup enters the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 40%"], // tune where the fade starts/finishes in view
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [0.35, 1])
  const y = useTransform(scrollYProgress, [0, 1], [12, 0])

  return (
    <section className="relative hidden lg:block bg-gradient-to-b from-[#F0FDFB] to-white pb-15">
      <div className="mx-auto w-full max-w-[1400px] px-4">
        <motion.div
          ref={ref}
          style={{ opacity, y }}
          className="mx-auto flex justify-center py-6"
        >
          <Safari
            url={url ?? "thankaroo.app/giftlist"}
            imageSrc={image ?? "GiftHub.png"}
            // Wider on desktop, but capped to avoid overflow
            className="w-[92vw] max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1500px] h-auto drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  )
}
