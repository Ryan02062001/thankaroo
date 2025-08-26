import Image from "next/image"
import { cn } from "@/lib/utils"

type Img = {
  src: string
  alt?: string
}

export default function ThreeImageShowcase({
  primary,
  left,
  right,
  className,
}: {
  primary: Img
  left: Img
  right: Img
  className?: string
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-6xl", className)}>
      {/* Soft backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#E0FFF4]/40 to-[#A8E6CF]/30 blur-3xl" />
      </div>

      <div className="relative h-[420px] sm:h-[520px]">
        {/* Left card */}
        <div className="absolute left-0 top-10 sm:top-16 w-[62%] sm:w-[520px] -rotate-6 rounded-2xl border bg-white shadow-xl overflow-hidden">
          <div className="relative h-[220px] sm:h-[300px]">
            <Image
              src={left.src}
              alt={left.alt ?? "Left image"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 62vw, 520px"
              priority={false}
            />
          </div>
        </div>

        {/* Right card */}
        <div className="absolute right-0 top-14 sm:top-20 w-[62%] sm:w-[520px] rotate-6 rounded-2xl border bg-white shadow-xl overflow-hidden">
          <div className="relative h-[220px] sm:h-[300px]">
            <Image
              src={right.src}
              alt={right.alt ?? "Right image"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 62vw, 520px"
              priority={false}
            />
          </div>
        </div>

        {/* Primary/front card */}
        <div className="absolute left-1/2 top-0 w-[86%] sm:w-[640px] -translate-x-1/2 rounded-3xl border bg-white shadow-2xl overflow-hidden">
          <div className="relative h-[280px] sm:h-[380px]">
            <Image
              src={primary.src}
              alt={primary.alt ?? "Primary image"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 86vw, 640px"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}


