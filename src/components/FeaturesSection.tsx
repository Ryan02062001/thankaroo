"use client"

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
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: Gift,
      title: "Never lose track of gifts",
      description: "Smart tracking with lists and tags so everything stays organized.",
      bullets: ["Log gifts in seconds", "Filter by type or event", "See totals at a glance"],
      color: "from-[#3EB489] to-[#A8E6CF]",
    },
    {
      icon: Mail,
      title: "Send thank‑you notes faster",
      description: "Know exactly who’s been thanked and what’s still pending.",
      bullets: ["Track who’s thanked", "One‑click mark as sent", "Draft notes instantly"],
      color: "from-[#A8E6CF] to-[#E0FFF4]",
    },
    {
      icon: Calendar,
      title: "Stay on schedule effortlessly",
      description: "A simple timeline keeps you moving without last‑minute stress.",
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
      bullets: ["Save personal details", "AI‑assisted note ideas", "Templates in your voice"],
      color: "from-[#A8E6CF] to-[#E0FFF4]",
    },
    {
      icon: Shield,
      title: "Privacy you can trust",
      description: "Your memories stay private on a secure, privacy‑first platform.",
      bullets: ["You control sharing", "Secure by default", "No surprises"],
      color: "from-[#E0FFF4] to-[#3EB489]",
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-white to-[#F0FDFB]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge
            variant="secondary"
            className="bg-[#E0FFF4] text-[#3EB489] border-[#A8E6CF]/50 mb-6"
          >
            ✨ Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Everything you need for
            <span className="block text-[#3EB489]">perfect thank‑you notes</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Designed for clarity and speed — scannable features with real benefits so you can
            track gifts and send notes without the overwhelm.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((f, i) => (
            <Card
              key={i}
              className="border-0 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow h-full"
            >
              <CardContent className="p-7 flex h-full flex-col">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}
                >
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-gray-600">{f.description}</p>
                <ul className="mt-4 space-y-2">
                  {f.bullets.map((b: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-[#3EB489]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 flex flex-col items-center gap-3">
          <div className="text-sm text-gray-500">
            Start free today — it only takes a few seconds.
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup" aria-label="Start free trial">
              <Button className="bg-[#3EB489] hover:bg-[#2d9970] text-white">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}