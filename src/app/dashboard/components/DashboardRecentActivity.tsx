"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardRecentActivityProps {
  gifts: {
    id: string;
    guestName: string;
    description: string;
    thankYouSent: boolean;
  }[];
}

export function DashboardRecentActivity({ gifts }: DashboardRecentActivityProps) {
  return (
    <Card>
      <CardContent>
        <h3 className="mb-4 font-semibold text-[#2d2d2d]">Recent Activity</h3>
        <div className="space-y-4">
          {gifts.slice(0, 5).map((gift) => (
            <div
              key={gift.id}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-[#2d2d2d]">
                  {gift.guestName}
                </p>
                <p className="text-xs text-[#2d2d2d]">{gift.description}</p>
              </div>
              <Badge
                variant={gift.thankYouSent ? "outline" : "secondary"}
                className={
                  gift.thankYouSent
                    ? "border-[#A6CFE2] bg-[#A6CFE2]/10 text-[#2d2d2d]"
                    : "bg-[#FFC5B2] text-[#2d2d2d]"
                }
              >
                {gift.thankYouSent ? "Thanked" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
