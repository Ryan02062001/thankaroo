"use client";
import * as React from "react";

export function AvatarCircle({ name }: { name: string }) {
  const initial = (name?.[0] ?? "?").toUpperCase();
  return (
    <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#98CFBA] text-[#2d2d2d] font-semibold shadow-sm ring-1 ring-black/5">
      {initial}
    </div>
  );
}
