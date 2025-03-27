"use client";

import {
  Gift,
  DollarSign,
  Package,
  Mail,
  CheckCircle,
  X,
  Calendar,
  Edit, // import the edit icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GiftItem } from "@/app/contexts/GiftContext";

interface GiftCardProps {
  gift: GiftItem;
  onDelete: (id: string) => void;
  onToggleThankYou: (id: string) => void;
  onEdit: (gift: GiftItem) => void;
}

export function GiftCard({
  gift,
  onDelete,
  onToggleThankYou,
  onEdit,
}: GiftCardProps) {
  return (
    <Card
  className={`overflow-hidden transition-all ${
    gift.thankYouSent ? "border-[#A8E6CF]" : ""
  }`}
>

      <CardContent className="p-2">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            {gift.type === "physical" ? (
              <Package className="h-4 w-4 text-[#2d2d2d]" />
            ) : gift.type === "monetary" ? (
              <DollarSign className="h-4 w-4 text-[#2d2d2d]" />
            ) : (
              <Gift className="h-4 w-4 text-[#2d2d2d]" />
            )}
            <span className="font-medium text-[#2d2d2d]">
              {gift.guestName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Edit button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#A8E6CF] hover:text-[#A8E6CF]"
              onClick={() => onEdit(gift)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#A8E6CF] hover:text-[#A8E6CF]"
              onClick={() => onDelete(gift.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-[#2d2d2d] mb-2">{gift.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-[#2d2d2d]">
              <Calendar className="h-3 w-3" />
              {new Date(gift.date).toLocaleDateString()}
            </div>
            <Button
              variant={gift.thankYouSent ? "outline" : "default"}
              size="sm"
              className={
                gift.thankYouSent
                  ? "border-[#A8E6CF] text-[#2d2d2d] hover:bg-[#A8E6CF]/20 bg-[#A8E6CF]"
                  : "border-[#A8E6CF] border text-[#2d2d2d] hover:bg-[#A8E6CF]/20 bg-[#fefefe]"
              }
              onClick={() => onToggleThankYou(gift.id)}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
