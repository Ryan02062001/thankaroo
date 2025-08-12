"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle, Heart, GiftIcon as Gift2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F0FDFB] via-white to-[#E0FFF4]/30">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E0FFF4]/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#A8E6CF]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#E0FFF4]/10 to-[#A8E6CF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-8">
            {/* Badge */}
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-[#E0FFF4] text-[#3EB489] hover:bg-[#E0FFF4] border-[#A8E6CF]/50 px-4 py-2"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Wedding Gift Tracker
              </Badge>
            </div>

            {/* Main heading */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                Never miss a
                <span className="block text-[#3EB489] relative">
                  thank-you note
                  <Heart className="absolute -top-2 -right-8 w-6 h-6 text-[#A8E6CF] fill-current animate-pulse" />
                </span>
                again
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Thankaroo helps couples effortlessly track wedding gifts and manage thank-you notes with elegance and
                simplicity.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/giftlist">
                <Button
                  size="lg"
                  className="bg-[#3EB489] hover:bg-[#2d9970] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-6 text-lg"
                >
                  Start Tracking Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-[#A8E6CF] text-[#3EB489] hover:bg-[#E0FFF4] hover:border-[#3EB489] px-8 py-6 text-lg transition-all duration-300 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-[#3EB489]" />
                Free forever
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-[#3EB489]" />
                No credit card required
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-[#3EB489]" />
                Privacy focused
              </div>
            </div>
          </div>

          {/* Enhanced mockup */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative">
              {/* Floating elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#A8E6CF] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Gift2 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#3EB489] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>

              {/* Main mockup */}
              <div className="relative w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl border border-[#E0FFF4] overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#3EB489] to-[#A8E6CF] p-6 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">Gift Tracker</h3>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        12 gifts
                      </Badge>
                    </div>
                    <p className="text-white/90 text-sm mt-1">Sarah & Mike&apos;s Wedding</p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Completed gift */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#E0FFF4] border border-[#A8E6CF]/30 transform hover:scale-105 transition-transform duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3EB489] rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Sarah & John</p>
                          <p className="text-sm text-gray-600">Crystal vase set</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-[#3EB489] text-white">
                        Sent
                      </Badge>
                    </div>

                    {/* Pending gifts */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Gift2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Michael & Emma</p>
                          <p className="text-sm text-gray-600">Kitchen mixer</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-gray-300 text-gray-600">
                        Pending
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Gift2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Aunt Patricia</p>
                          <p className="text-sm text-gray-600">$100 gift card</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-gray-300 text-gray-600">
                        Pending
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}