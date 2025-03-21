// src/app/dashboard/components/DashboardStatisticCards.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatisticCardsProps {
  totalGifts: number;
  thankedGifts: number;
  thankYouProgress: number;
}

// Use a named export
export function DashboardStatisticCards({
  totalGifts,
  thankedGifts,
  thankYouProgress,
}: DashboardStatisticCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#2d2d2d]">{totalGifts}</div>
            <p className="text-xs text-[#2d2d2d]">Total Gifts</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent >
          <div className="text-center">
            <div className="text-2xl font-bold text-[#2d2d2d]">{thankedGifts}</div>
            <p className="text-xs text-[#2d2d2d]">Thank You Notes Sent</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#2d2d2d]">
              {totalGifts - thankedGifts}
            </div>
            <p className="text-xs text-[#2d2d2d]">Thank You Notes Pending</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent >
          <div className="text-center">
            <div className="text-2xl font-bold text-[#2d2d2d]">
              {thankYouProgress}%
            </div>
            <p className="text-xs text-[#2d2d2d]">Completion Rate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
