"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ShimmerButtonBaseProps = React.ComponentProps<typeof Button>

export default function ShimmerButtonBase({ className, children, ...props }: ShimmerButtonBaseProps) {
  return (
    <Button
      {...props}
      className={cn(
        "relative overflow-hidden",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent,rgba(255,250,242,0.18),rgba(255,243,228,0.45),rgba(255,250,242,0.18),transparent)] animate-[shimmer_2.8s_linear_infinite]"
      />
      <span className="relative z-10 inline-flex items-center">{children}</span>
    </Button>
  )
}

