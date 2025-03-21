"use client";

import { GiftItem } from "@/app/contexts/GiftContext";
import { GiftCard } from "./GiftCard";
import { Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GiftListProps {
  gifts: GiftItem[];
  onDeleteGift: (id: string) => void;
  onToggleThankYou: (id: string) => void;
  onAddGift?: () => void;
}

export function GiftList({
  gifts,
  onDeleteGift,
  onToggleThankYou,
  onAddGift,
}: GiftListProps) {
  return gifts.length > 0 ? (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
          onDelete={onDeleteGift}
          onToggleThankYou={onToggleThankYou}
        />
      ))}
    </div>
  ) : (
    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <Gift className="h-12 w-12 text-[#2d2d2d]/50" />
      <h3 className="mt-4 text-lg font-semibold text-[#2d2d2d]">
        No gifts found
      </h3>
      <p className="mt-2 text-sm text-[#2d2d2d]">
        {gifts.length === 0
          ? "Add your first gift to get started!"
          : "Try adjusting your filters or search term."}
      </p>
      {gifts.length === 0 && onAddGift && (
        <Button
          className="mt-4 bg-[#A8E6CF] hover:bg-[#98CFBA] text-[#2d2d2d]"
          onClick={onAddGift}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Gift
        </Button>
      )}
    </div>
  );
}
