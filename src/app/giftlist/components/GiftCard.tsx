"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Gift as GiftIcon, DollarSign, Package, Mail, CheckCircle, X, Calendar, Edit,
} from "lucide-react";
import { deleteGift, toggleThankYou } from "@/app/actions/gifts";
import * as React from "react";
import type { UIGift } from "../giftlist-client";
import { usePathname } from "next/navigation";

export function GiftCard({
  listId,
  gift,
  onEdit,
}: {
  listId: string;
  gift: UIGift;
  onEdit: (gift: UIGift) => void;
}) {
  const pathname = usePathname();
  const TypeIcon = gift.type === "non registry" ? Package : gift.type === "monetary" ? DollarSign : GiftIcon;

  return (
    <Card className={`overflow-hidden transition-all ${gift.thankYouSent ? "border-[#A8E6CF]" : ""}`}>
      <CardContent className="p-2">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-[#2d2d2d]" />
            <span className="font-medium text-[#2d2d2d]">{gift.guestName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#A8E6CF] hover:text-[#A8E6CF]" onClick={() => onEdit(gift)}>
              <Edit className="h-4 w-4" />
            </Button>

            <form action={deleteGift}>
              <input type="hidden" name="id" value={gift.id} />
              <input type="hidden" name="list_id" value={listId} />
              <input type="hidden" name="next" value={pathname} />
              <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-[#A8E6CF] hover:text-[#A8E6CF]">
                <X className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-2 text-sm text-[#2d2d2d]">{gift.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-[#2d2d2d]">
              <Calendar className="h-3 w-3" />
              {new Date(gift.date).toLocaleDateString()}
            </div>

            <form action={toggleThankYou}>
              <input type="hidden" name="id" value={gift.id} />
              <input type="hidden" name="list_id" value={listId} />
              <input type="hidden" name="next" value={pathname} />
              <Button
                size="sm"
                className={
                  gift.thankYouSent
                    ? "border-[#A8E6CF] bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#A8E6CF]/90"
                    : "border-[#A8E6CF] bg-[#fefefe] text-[#2d2d2d] hover:bg-[#A8E6CF]/20"
                }
                variant={gift.thankYouSent ? "outline" : "default"}
                type="submit"
              >
                {gift.thankYouSent ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Thanked
                  </>
                ) : (
                  <>
                    <Mail className="mr-1 h-3 w-3" />
                    Mark as Thanked
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
