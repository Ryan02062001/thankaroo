// /Users/ryancooper/thankaroo/src/components/HeroMockup.tsx
"use client"

import { Safari } from "@/components/magicui/safari"

interface HeroMockupProps {
  image?: string;
  alt?: string;
  url?: string;
}

export default function HeroMockup({
}: HeroMockupProps) {
  return (
    <section className="relative -mt-16 md:-mt-40 lg:-mt-32 mb-8 md:mb-16 lg:mb-20">
      <div className="container mx-auto px-4">
        <div className="pointer-events-none relative z-10 mx-auto w-[min(1100px,92vw)]">
          <Safari
            url="thankaroo.app/giftlist"
            className="size-full"
            imageSrc="Giftlist.png"
          />
        </div>
      </div>
    </section>
  )
}