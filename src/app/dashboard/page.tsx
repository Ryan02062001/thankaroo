// src/app/dashboard/page.tsx
"use client";

import { useGifts } from "../contexts/GiftContext";
import { DashboardStatisticCards } from "./components/DashboardStatisticCards";
import { DashboardThankYouProgress } from "./components/DashboardThankYouProgress";
import { DashboardGiftsByType } from "./components/DashboardGiftsByType";
import { DashboardRecentActivity } from "./components/DashboardRecentActivity";
import { DashboardExportButton } from "./components/DashboardExportButton"; // no props now
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListSelector } from "@/components/ui/list-selector";

export default function DashboardPage() {
  const { gifts } = useGifts();

  const totalGifts = gifts.length;
  const thankedGifts = gifts.filter((g) => g.thankYouSent).length;
  const thankYouProgress =
    totalGifts > 0 ? Math.round((thankedGifts / totalGifts) * 100) : 0;
  const giftsByType = {
    nonRegistry: gifts.filter((g) => g.type === "non registry").length,
    monetary: gifts.filter((g) => g.type === "monetary").length,
    registry: gifts.filter((g) => g.type === "registry").length,
    multiple: gifts.filter((g) => g.type === "multiple").length,
  };

  return (
    <div className="min-h-screen bg-[#fefefe] pt-20">
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center space-x-7 mb-5">
          <h1 className="text-4xl font-bold text-[#2d2d2d]">Dashboard</h1>
          <Link href="/giftlist">
            <Button size="sm" variant="ghost" className="text-[#2d2d2d]">
              View Gift List
            </Button>
          </Link>
        </div>

        <ListSelector />

        <DashboardStatisticCards
          totalGifts={totalGifts}
          thankedGifts={thankedGifts}
          thankYouProgress={thankYouProgress}
        />
        <DashboardThankYouProgress
          thankedGifts={thankedGifts}
          totalGifts={totalGifts}
          thankYouProgress={thankYouProgress}
        />
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <DashboardGiftsByType
            giftsByType={giftsByType}
            totalGifts={totalGifts}
          />
          <DashboardRecentActivity gifts={gifts} />
        </div>

        {/* no props passed here */}
        <DashboardExportButton />
      </main>
    </div>
  );
}
