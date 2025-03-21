"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package, DollarSign, Gift } from "lucide-react";

interface DashboardGiftsByTypeProps {
  giftsByType: {
    physical: number;
    monetary: number;
    registry: number;
  };
  totalGifts: number;
}

export function DashboardGiftsByType({
  giftsByType,
  totalGifts,
}: DashboardGiftsByTypeProps) {
  return (
    <Card>
      <CardContent>
        <h3 className="mb-4 font-semibold text-[#2d2d2d]">Gifts by Type</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[#2d2d2d]" />
                <span className="text-sm font-medium text-[#2d2d2d]">
                  Physical Gifts
                </span>
              </div>
              <span className="text-sm text-[#2d2d2d]">
                {giftsByType.physical}
              </span>
            </div>
            <Progress
              value={(giftsByType.physical / totalGifts) * 100 || 0}
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#2d2d2d]" />
                <span className="text-sm font-medium text-[#2d2d2d]">
                  Monetary Gifts
                </span>
              </div>
              <span className="text-sm text-[#2d2d2d]">
                {giftsByType.monetary}
              </span>
            </div>
            <Progress
              value={(giftsByType.monetary / totalGifts) * 100 || 0}
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#2d2d2d]" />
                <span className="text-sm font-medium text-[#2d2d2d]">
                  Registry Gifts
                </span>
              </div>
              <span className="text-sm text-[#2d2d2d]">
                {giftsByType.registry}
              </span>
            </div>
            <Progress
              value={(giftsByType.registry / totalGifts) * 100 || 0}
              className="h-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
