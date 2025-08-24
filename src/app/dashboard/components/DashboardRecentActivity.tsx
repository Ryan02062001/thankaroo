"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DashboardRecentActivity({
  gifts,
}: {
  gifts: { id: string; guestName: string; description: string; thankYouSent: boolean }[];
}) {
  return (
    <Card>
      <CardContent className="overflow-x-hidden">
        <h3 className="mb-4 font-semibold text-[#2d2d2d]">Recent Activity</h3>
        <div className="space-y-4">
          {gifts.slice(0, 5).map((gift) => (
            <div
              key={gift.id}
              className="flex items-center justify-between border-b pb-2 last:border-0 overflow-hidden"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-sm font-medium text-[#2d2d2d] truncate break-words">
                  {gift.guestName}
                </p>
                <p className="text-xs text-[#2d2d2d] break-words whitespace-normal overflow-hidden [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
                  {gift.description}
                </p>
              </div>
              <Badge
                variant={gift.thankYouSent ? "outline" : "secondary"}
                className={
                  gift.thankYouSent
                    ? "border-[#A6CFE2] bg-[#A6CFE2]/10 text-[#2d2d2d] shrink-0"
                    : "bg-[#FFC5B2] text-[#2d2d2d] shrink-0"
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