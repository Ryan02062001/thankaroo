"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardThankYouProgressProps {
  thankedGifts: number;
  totalGifts: number;
  thankYouProgress: number;
}

export function DashboardThankYouProgress({
  thankedGifts,
  totalGifts,
  thankYouProgress,
}: DashboardThankYouProgressProps) {
  return (
    <Card className="mb-6">
      <CardContent>
        <h3 className="mb-4 font-semibold text-[#2d2d2d]">Thank You Progress</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#2d2d2d]">
              Overall Progress
            </span>
            <span className="text-sm text-[#2d2d2d]">
              {thankedGifts} of {totalGifts}
            </span>
          </div>
          <Progress value={thankYouProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
