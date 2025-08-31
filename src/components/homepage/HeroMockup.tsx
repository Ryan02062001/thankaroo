// /Users/ryancooper/thankaroo/src/components/HeroMockup.tsx
"use client"

import * as React from "react"
import { motion, useInView, type Variants } from "framer-motion"
import { Safari } from "@/components/magicui/safari"

interface HeroMockupProps { image?: string; alt?: string; url?: string }

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 56, scale: 0.94 },
  show:   { opacity: 1, y: 0, scale: 1,   transition: { duration: 0.55, ease: [0.2, 0.65, 0.3, 0.9] } },
  hide:   { opacity: 0, y: 56, scale: 0.94, transition: { duration: 0.5,  ease: [0.2, 0.65, 0.3, 0.9] } },
}

type CardCfg = {
  id: "add-gift" | "compose" | "gift-hub"
  url: string
  img: string
  alt: string
  baseClass: string
  baseRotate: number
  baseZ: number
  enterDelay: number
}

type WidthMap = Partial<Record<CardCfg["id"], number>>

function CardItem({
  cfg,
  hovered,
  setHovered,
  centerWidth,
  hoveredWidth,
  onMeasure,
}: {
  cfg: CardCfg
  hovered: CardCfg["id"] | null
  setHovered: (v: CardCfg["id"] | null) => void
  centerWidth: number | undefined
  hoveredWidth: number | undefined
  onMeasure: (id: CardCfg["id"], w: number) => void
}) {
  // Outer ref for inView (enter/exit)
  const inViewRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(inViewRef, { amount: 0.12 })

  // Inner ref for accurate width measurement (handles breakpoints)
  const measureRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!measureRef.current) return
    const el = measureRef.current
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width
      if (w) onMeasure(cfg.id, Math.round(w))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [cfg.id, onMeasure])

  const isActive = hovered === cfg.id
  const isDimmed = hovered !== null && hovered !== cfg.id

  // Fallback ratio (close to 98%/78% ≈ 1.26 and 960/800 = 1.2)
  const FALLBACK_SIDE_TO_CENTER = 1.22
  const FALLBACK_CENTER_TO_SIDE = 1 / FALLBACK_SIDE_TO_CENTER

  // Compute target scale for swap:
  // - If hovering a side card -> grow that side card to center width
  // - Simultaneously shrink center to the hovered side card width
  let targetScale = 1

  if (isActive) {
    if (cfg.id === "gift-hub") {
      // Hovering the center: keep it large but give a tiny lift/scale for feedback
      targetScale = 1.03
    } else {
      // Hovering a side card: grow to center size precisely if we can measure
      const ratio =
        centerWidth && hoveredWidth
          ? centerWidth / hoveredWidth
          : FALLBACK_SIDE_TO_CENTER
      targetScale = ratio
    }
  } else if (cfg.id === "gift-hub" && hovered && hovered !== "gift-hub") {
    // Center shrinks to hovered side's original size
    const ratio =
      centerWidth && hoveredWidth
        ? hoveredWidth / centerWidth
        : FALLBACK_CENTER_TO_SIDE
    targetScale = ratio
  } else {
    targetScale = 1
  }

  return (
    // OUTER: scroll-driven enter/exit
    <motion.div
      ref={inViewRef}
      className={cfg.baseClass}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "show" : "hide"}
      transition={{ delay: cfg.enterDelay }}
      style={{ zIndex: isActive ? 30 : cfg.baseZ, willChange: "transform, opacity" }}
    >
      {/* INNER: hover focus + size swap + measuring element */}
      <motion.div
        ref={measureRef}
        onHoverStart={() => setHovered(cfg.id)}
        onHoverEnd={() => setHovered(null)}
        onFocus={() => setHovered(cfg.id)}
        onBlur={() => setHovered(null)}
        tabIndex={0}
        animate={{
          rotate: isActive ? 0 : cfg.baseRotate,
          y: isActive ? -12 : 0,
          scale: targetScale,
          opacity: isDimmed ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 360, damping: 26 }}
        style={{ willChange: "transform, opacity" }}
      >
        <Safari
          url={cfg.url}
          imageSrc={cfg.img}
          className="w-full h-auto drop-shadow-2xl cursor-pointer"
        />
      </motion.div>
    </motion.div>
  )
}

export default function HeroMockup({}: HeroMockupProps) {
  const [hovered, setHovered] = React.useState<CardCfg["id"] | null>(null)
  const [widths, setWidths] = React.useState<WidthMap>({})

  const onMeasure = React.useCallback((id: CardCfg["id"], w: number) => {
    setWidths((prev) => (prev[id] === w ? prev : { ...prev, [id]: w }))
  }, [])

  const cards: CardCfg[] = [
    {
      id: "add-gift",
      url: "thankaroo.app/giftlist",
      img: "AddGift.png",
      alt: "Add Gift",
      baseClass: "absolute left-0 top-12 sm:top-20 w-[78%] sm:w-[800px] h-auto",
      baseRotate: -6,
      baseZ: 10,
      enterDelay: 0.08,
    },
    {
      id: "compose",
      url: "thankaroo.app/giftlist",
      img: "ComposeLetter.png",
      alt: "Compose Thank‑You",
      baseClass: "absolute right-0 top-16 sm:top-24 w-[78%] sm:w-[800px] h-auto",
      baseRotate: 6,
      baseZ: 10,
      enterDelay: 0.14,
    },
    {
      id: "gift-hub",
      url: "thankaroo.app/giftlist",
      img: "GiftHub.png",
      alt: "Gift Hub",
      baseClass:
        "absolute left-1/2 top-0 -translate-x-1/2 w-[98%] sm:w-[960px] h-auto",
      baseRotate: 0,
      baseZ: 20,
      enterDelay: 0.0,
    },
  ]

  const centerWidth = widths["gift-hub"]
  const hoveredWidth = hovered ? widths[hovered] : undefined

  return (
    <section className="relative">
      <div className="mx-auto w-full max-w-[1600px] px-4">
        <div className="relative mx-auto w-full h-[640px] sm:h-[820px]">
          {cards.map((cfg) => (
            <CardItem
              key={cfg.id}
              cfg={cfg}
              hovered={hovered}
              setHovered={setHovered}
              centerWidth={centerWidth}
              hoveredWidth={hoveredWidth}
              onMeasure={onMeasure}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
