"use client"

import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  Heart,
  Sparkles,
  Clock,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import HeroMockup from "./HeroMockup"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F0FDFB] via-white to-[#E0FFF4]/30">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E0FFF4]/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#A8E6CF]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#E0FFF4]/10 to-[#A8E6CF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 pt-16 md:pt-24 lg:pt-28 pb-32 md:pb-40 lg:pb-48">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="secondary"
              className="bg-[#E0FFF4] text-[#3EB489] hover:bg-[#E0FFF4] border-[#A8E6CF]/50 px-4 py-2"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Wedding Gift Tracker
            </Badge>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-orange-200 px-3 py-1 text-sm"
            >
              🔥 10,000+ couples trust us
            </Badge>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-8xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
              Never Miss A
              <span className="block text-[#3EB489] relative">
                Thank-You Note
                <Heart className="absolute -top-2 -right-8 w-6 h-6 text-[#A8E6CF] fill-current animate-pulse" />
              </span>
              Again
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Track gifts in one place, send beautiful thank‑you notes in minutes, and stay on top of reminders — from engagement party to wedding day.
            </p>
          </div>

          <div className="mx-auto max-w-xl flex items-center justify-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div className="text-sm">
              <span className="font-semibold text-yellow-800">Wedding season is here!</span>
              <span className="text-yellow-700 ml-1">Start your free trial before the gift rush begins.</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center max-w-lg w-full mx-auto">
              <Link href="/signup" aria-label="Start free trial" className="w-full sm:w-1/2">
                <Button
                  size="lg"
                  className="h-12 px-6 bg-[#2f9c79] hover:bg-[#258868] text-white shadow-lg hover:shadow-xl transition-all w-full"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <div className="w-full sm:w-1/2">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 border-[#A8E6CF] text-[#2f9c79] hover:bg-[#E0FFF4] hover:border-[#2f9c79] w-full"
                  aria-label="Watch a 2-minute demo"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2‑min Demo
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">30‑day free trial. No credit card required. Cancel anytime.</p>
          </div>

          <ul className="mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-gray-700 max-w-6xl mx-auto">
            <li className="flex items-start gap-2 text-center">
              <CheckCircle className="mt-0.5 h-5 w-5 text-[#2f9c79] flex-shrink-0" aria-hidden />
              <span>Effortless gift tracking with smart lists</span>
            </li>
            <li className="flex items-start gap-2 text-center">
              <CheckCircle className="mt-0.5 h-5 w-5 text-[#2f9c79] flex-shrink-0" aria-hidden />
              <span>AI‑assisted thank‑you notes and templates</span>
            </li>
            <li className="flex items-start gap-2 text-center">
              <CheckCircle className="mt-0.5 h-5 w-5 text-[#2f9c79] flex-shrink-0" aria-hidden />
              <span>Automatic reminders so nothing slips</span>
            </li>
            <li className="flex items-start gap-2 text-center">
              <CheckCircle className="mt-0.5 h-5 w-5 text-[#2f9c79] flex-shrink-0" aria-hidden />
              <span>Invite your partner to collaborate</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Mockup */}
      <HeroMockup />
    </section>
  )
}