"use client"

import HeroSection from "@/components/homepage/HeroSection"
// import FeaturesSection from "@/components/homepage/FeaturesSection"
import HowItWorksSection from "@/components/homepage/HowItWorksSection"
// import PrivacySection from "@/components/PrivacySection"
import FAQSection from "@/components/homepage/FAQSection"
import CallToActionSection from "@/components/homepage/CallToActionSection"
import IphonePairMockup from "@/components/homepage/IphonePairMockup"
import HeroMockup from "@/components/homepage/HeroMockup"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <section aria-labelledby="home-hero" className="flex-1">
        <HeroSection />
        {/* <FeaturesSection /> */}
          {/* Desktop: big Safari mockup */}
          <HeroMockup />

{/* Mobile/Tablet: single iPhone mockup */}
<IphonePairMockup className="block md:hidden" />
        <HowItWorksSection />
        {/* <PrivacySection /> */}
        <FAQSection />
        <CallToActionSection />
      </section>
    </div>
  )
}