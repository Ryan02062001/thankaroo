"use client";
import { Badge } from "@/components/ui/badge";
import { Gift, CheckCircle2 } from "lucide-react";
import type { UIGift } from "./types";

export function GiftContextCard({ gift }: { gift: UIGift }) {
  return (
    <section className="rounded-xl bg-gray-50/60 border border-gray-200/60 p-4" aria-labelledby={`gift-context-${gift.id}`}> 
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#A8E6CF]/20 rounded-lg">
          <Gift className="h-4 w-4 text-[#A8E6CF]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 id={`gift-context-${gift.id}`} className="font-medium text-[#2d2d2d] mb-1 break-words break-all">
            {gift.description || "No description"}
          </h3>
          <div className="text-sm text-gray-600 break-words break-all">
            Received on{" "}
            {new Date(gift.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          {gift.thankYouSent && (
            <Badge className="mt-2 bg-[#A8E6CF]/20 text-[#2d2d2d]">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Thank you sent
            </Badge>
          )}
        </div>
      </div>
    </section>
  );
}
