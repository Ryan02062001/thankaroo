"use client";
import { CheckCircle2 } from "lucide-react";
import type { UIGift } from "./types";

export function GiftChips({
  gifts,
  selectedGiftId,
  onSelectGift,
}: {
  gifts: UIGift[];
  selectedGiftId: string | null;
  onSelectGift: (id: string) => void;
}) {
  const label = (g: UIGift) => {
    const date = new Date(g.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const desc = (g.description || "No description").trim();
    const short = desc.length > 28 ? desc.slice(0, 28) + "…" : desc;
    return `${short} • ${date}`;
  };

  return (
    <div>
      <div className="text-sm font-medium text-[#2d2d2d] mb-2">Which gift?</div>
      <div className="flex gap-2 flex-wrap">
        {gifts.map((g) => {
          const active = g.id === selectedGiftId;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelectGift(g.id)}
              className={`relative rounded-full border px-3 py-2 text-sm transition-all ${
                active
                  ? "border-[#A8E6CF] bg-[#A8E6CF]/10 text-[#2d2d2d] shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm text-[#2d2d2d]"
              }`}
              title={g.description}
            >
              <span className="truncate max-w-[14rem] inline-block align-middle">{label(g)}</span>
              {g.thankYouSent && (
                <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-[#A8E6CF] bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
