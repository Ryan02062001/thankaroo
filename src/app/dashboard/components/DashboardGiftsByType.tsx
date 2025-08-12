"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package, DollarSign, Gift } from "lucide-react";

export function DashboardGiftsByType({
  giftsByType,
  totalGifts,
}: {
  giftsByType: { nonRegistry: number; monetary: number; registry: number; multiple: number };
  totalGifts: number;
}) {
  const pct = (n: number) => (totalGifts > 0 ? (n / totalGifts) * 100 : 0);
  return (
    <Card>
      <CardContent>
        <h3 className="mb-4 font-semibold text-[#2d2d2d]">Gifts by Type</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[#2d2d2d]" />
                <span className="text-sm font-medium text-[#2d2d2d]">Non Registry</span>
              </div>
              <span className="text-sm text-[#2d2d2d]">{giftsByType.nonRegistry}</span>
            </div>
            <Progress value={pct(giftsByType.nonRegistry)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#2d2d2d]" />
                <span className="text-sm font-medium text-[#2d2d2d]">Monetary Gifts</span>
              </div>
              <span className="text-sm text-[#2d2d2d]">{giftsByType.monetary}</span>
            </div>
            <Progress value={pct(giftsByType.monetary)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#2d2d2d]" />
                <span className="text-sm font-medium text-[#2d2d2d]">Registry Gifts</span>
              </div>
              <span className="text-sm text-[#2d2d2d]">{giftsByType.registry}</span>
            </div>
            <Progress value={pct(giftsByType.registry)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#2d2d2d]" />
                <span className="text-sm font-medium text-[#2d2d2d]">Multiple Gifts</span>
              </div>
              <span className="text-sm text-[#2d2d2d]">{giftsByType.multiple}</span>
            </div>
            <Progress value={pct(giftsByType.multiple)} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
