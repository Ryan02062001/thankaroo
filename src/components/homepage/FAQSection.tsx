"use client"

import { useState, useRef } from "react"
import {
  ChevronDown,
  Heart,
  Smartphone,
  Shield,
  FileText,
  Sparkles,
  HelpCircle
} from "lucide-react"
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  cubicBezier,
  type Variants,
} from "framer-motion"

interface FAQItem {
  id: string
  question: string
  answer: string
  icon: React.ComponentType<{ className?: string }>
  category: string
}

const faqData: FAQItem[] = [
  {
    id: "free",
    question: "Is Thankaroo free to use?",
    answer:
      "Yes! Basic gift tracking with up to 50 gifts and thank-you note templates is completely free. Premium features like AI-powered note generation, unlimited gifts, and advanced reminders are available with our affordable subscription plans.",
    icon: Heart,
    category: "pricing",
  },
  {
    id: "mobile",
    question: "Can I use Thankaroo on my phone?",
    answer:
      "Absolutely! Thankaroo is a responsive Progressive Web App that works perfectly on any device with a modern browser. You can install it directly on your phone for a native app-like experience.",
    icon: Smartphone,
    category: "technical",
  },
  {
    id: "registry",
    question: "Does it work with my wedding registry?",
    answer:
      "Thankaroo complements your existing registries perfectly. You can import gifts from any registry or add them manually. It tracks everything in one place, regardless of where the gift came from.",
    icon: FileText,
    category: "features",
  },
  {
    id: "ai-notes",
    question: "How does the AI thank-you note generation work?",
    answer:
      "Our AI analyzes your gift details, relationship with the giver, and your writing style to create personalized thank-you notes. Simply add gift information and let our AI craft beautiful, heartfelt messages that sound just like you.",
    icon: Sparkles,
    category: "features",
  },
  {
    id: "security",
    question: "Is my wedding gift data secure?",
    answer:
      "Yes! We use Supabase, which provides enterprise-grade security. Your personal information and gift data are stored securely and we never share it with third parties without your explicit consent. All data is hosted in secure, audited data centers with regular security updates.",
    icon: Shield,
    category: "privacy",
  },
  
]

/** Typed easing (smooth, elegant) */
const easeOutExpo = cubicBezier(0.22, 1, 0.36, 1)

/** Variants */
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.995 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.6, ease: easeOutExpo } },
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const prefersReduced = useReducedMotion()

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <motion.section
      id="faq"
      className="relative bg-white py-16 md:py-24 lg:py-32 overflow-hidden"
      initial="hidden"
      whileInView="show"
      viewport={{ amount: 0.2, once: false }}
    >
      {/* Background decoration (gentle float; disabled if reduced-motion) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#A8E6CF]/10 to-transparent rounded-full blur-3xl"
          animate={prefersReduced ? {} : { y: [0, -8, 0], x: [0, 6, 0] }}
          transition={prefersReduced ? undefined : { duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-[#3EB489]/10 to-transparent rounded-full blur-3xl"
          animate={prefersReduced ? {} : { y: [0, 10, 0], x: [0, -8, 0] }}
          transition={prefersReduced ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="relative container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          className="text-center mb-16"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E0FFF4] to-[#A8E6CF]/20 px-4 py-2 text-sm font-medium text-[#3EB489] shadow-sm mb-6">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>

          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl bg-gradient-to-r from-[#2D2D2D] to-[#5B5B5B] bg-clip-text text-transparent mb-4">
            Everything you need to know about Thankaroo
          </h2>
          <p className="max-w-[600px] text-lg text-gray-600 dark:text-gray-300 leading-relaxed mx-auto">
            Get answers to common questions about our wedding gift tracking and thank-you note platform.
          </p>
        </motion.div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item) => {
              const Icon = item.icon
              const isOpen = openItems.has(item.id)
              const panelId = `faq-panel-${item.id}`

              return (
                <FAQRow
                  key={item.id}
                  icon={Icon}
                  item={item}
                  isOpen={isOpen}
                  onToggle={() => toggleItem(item.id)}
                  panelId={panelId}
                />
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          variants={headerVariants}
          className="mt-16 text-center"
          style={{ willChange: "transform, opacity" }}
        >
          {/* <motion.div
            whileHover={prefersReduced ? undefined : { y: -2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#3EB489] to-[#2F9C79] px-8 py-4 text-white shadow-lg hover:shadow-xl cursor-pointer"
            role="link"
            tabIndex={0}
          >
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Still have questions?</span>
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </motion.div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p> */}
        </motion.div>
      </div>
    </motion.section>
  )
}

/** Single FAQ row with subtle scroll-in + expand/collapse motion */
function FAQRow({
  item,
  icon: Icon,
  isOpen,
  onToggle,
  panelId,
}: {
  item: FAQItem
  icon: React.ComponentType<{ className?: string }>
  isOpen: boolean
  onToggle: () => void
  panelId: string
}) {
  const prefersReduced = useReducedMotion()
  const rowRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rowRef, { amount: 0.25 })
  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.995 },
    show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45, ease: easeOutExpo } },
  }

  return (
    <motion.div
      ref={rowRef}
      variants={rowVariants}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="group"
      style={{ willChange: "transform, opacity" }}
    >
      <div
        className={`
          relative rounded-2xl border-2 transition-all duration-200
          ${isOpen
            ? 'border-[#3EB489] bg-[#F0FDFB] dark:bg-[#1A1A1A] shadow-lg'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-[#3EB489]/50 hover:shadow-md'
          }
        `}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#A8E6CF]/5 to-[#3EB489]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="relative">
          {/* Clickable header as a button (accessibility) */}
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={onToggle}
            className="w-full text-left p-6 md:p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Icon */}
                <motion.div
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  className={`
                    flex-shrink-0 w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center
                    ${isOpen
                      ? 'bg-[#3EB489] text-white shadow-lg'
                      : 'bg-[#F0FDFB] dark:bg-gray-800 text-[#3EB489] group-hover:bg-[#3EB489] group-hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                {/* Question text */}
                <div className="flex-1 space-y-3 min-w-0">
                  <h3
                    className={`
                      text-lg md:text-xl font-semibold transition-colors duration-200 leading-tight
                      ${isOpen
                        ? 'text-[#3EB489]'
                        : 'text-[#2D2D2D] dark:text-white group-hover:text-[#3EB489]'
                      }
                    `}
                  >
                    {item.question}
                  </h3>
                </div>
              </div>

              {/* Chevron */}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: easeOutExpo }}
                className="flex-shrink-0"
              >
                <ChevronDown
                  className={`
                    w-5 h-5 transition-colors duration-200
                    ${isOpen ? 'text-[#3EB489]' : 'text-gray-400 group-hover:text-[#3EB489]'}
                  `}
                />
              </motion.div>
            </div>
          </button>

          {/* Collapsible content */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                id={panelId}
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: easeOutExpo }}
                style={{ overflow: "hidden", willChange: "height, opacity" }}
              >
                <div className="px-6 md:px-8 pb-6 md:pb-8">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed pt-2">
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
