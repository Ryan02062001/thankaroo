"use client";

import { Button } from "@/components/ui/button";
import { Gift as GiftIcon, Plus } from "lucide-react";
import type { UIGift } from "../gift-hub-client";
import { GiftCard } from "./GiftCard";

export function GiftList({
  gifts,
  noteStatusMap,
  onEditGift,
  onAddGift,
  onRemindGift,
  onComposeThankYou,
  onDeleteGift,
}: {
  gifts: UIGift[];
  noteStatusMap: Map<string, "none" | "draft" | "sent">;
  onEditGift: (g: UIGift) => void;
  onAddGift: () => void;
  onRemindGift: (g: UIGift) => void;
  onComposeThankYou: (g: UIGift) => void;
  onDeleteGift: (g: UIGift) => void;
}) {
  return gifts.length > 0 ? (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
          noteStatus={noteStatusMap.get(gift.id) ?? "none"}
          onEdit={onEditGift}
          onRemind={onRemindGift}
          onCompose={() => onComposeThankYou(gift)}
          onDelete={() => onDeleteGift(gift)}
        />
      ))}
    </div>
  ) : (
    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <GiftIcon className="h-12 w-12 text-[#2d2d2d]/50" />
      <h3 className="mt-4 text-lg font-semibold text-[#2d2d2d]">No gifts found</h3>
      <p className="mt-2 text-sm text-[#2d2d2d]">Add your first gift to get started!</p>
      <Button className="mt-4 bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]" onClick={onAddGift}>
        <Plus className="mr-2 h-4 w-4 text-[#2d2d2d]" />
        Add Your First Gift
      </Button>
    </div>
  );
}