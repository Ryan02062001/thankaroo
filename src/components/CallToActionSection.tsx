"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CallToActionSection() {
  return (
    <section className="bg-[#3EB489] py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Start Tracking Your Wedding Gifts Today with Thankaroo.{" "}
            </h2>
            <p className="max-w-[900px] text-[#D1F2EB] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of couples who&apos;ve simplified their thank-you process with Thankaroo.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link href="/giftlist">
              <Button size="lg" className="bg-white text-[#3EB489] hover:bg-[#F0FDFB]">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}


