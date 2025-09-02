"use client";

import * as React from "react";
import Iphone15Pro from "@/components/magicui/iphone-15-pro";

type IphonePairMockupProps = {
  leftSrc?: string;
  rightSrc?: string;
  className?: string;
};

export default function IphonePairMockup({
  leftSrc = "/gift-list-view.PNG",
  rightSrc = "/add-gift-view.PNG",
  className,
}: IphonePairMockupProps) {
  return (
    <div className={["mx-auto w-full max-w-5xl px-4", className].filter(Boolean).join(" ")}> 
      <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-10">
        <div className="w-full max-w-[380px]">
          <div className="aspect-[433/882]">
            <Iphone15Pro width={433} height={882} src={leftSrc} className="h-full w-full" />
          </div>
        </div>
        <div className="w-full max-w-[380px]">
          <div className="aspect-[433/882]">
            <Iphone15Pro width={433} height={882} src={rightSrc} className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}


