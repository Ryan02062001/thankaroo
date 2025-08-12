"use client"

import HeroSection from "@/components/HeroSection"
import FeaturesSection from "@/components/FeaturesSection"
import HowItWorksSection from "@/components/HowItWorksSection"
import PrivacySection from "@/components/PrivacySection"
import FAQSection from "@/components/FAQSection"
import CallToActionSection from "@/components/CallToActionSection"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PrivacySection />
        <FAQSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  )
}
