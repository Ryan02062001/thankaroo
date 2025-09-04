"use client";

import * as React from "react";
import Iphone15Pro from "@/components/magicui/iphone-15-pro";

type IphonePairMockupProps = {
  leftSrc?: string;
  className?: string;
};

export default function IphonePairMockup({
  leftSrc = "/gift-list-view.PNG",
  className,
}: IphonePairMockupProps) {
  return (
    <div
      className={[
        "mx-auto w-full max-w-5xl px-4 lg:hidden", // hide on desktop by default
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[380px]">
          <div className="aspect-[433/882]">
            <Iphone15Pro width={433} height={882} src={leftSrc} className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
