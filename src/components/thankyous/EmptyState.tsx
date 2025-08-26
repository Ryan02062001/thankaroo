"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#A8E6CF]/20 to-[#A8E6CF]/40 rounded-full flex items-center justify-center mb-6">
          <Gift className="h-8 w-8 text-[#A8E6CF]" />
        </div>
        <h3 className="text-xl font-semibold text-[#2d2d2d] mb-2">No matches</h3>
        <p className="text-gray-600 mb-4">Try clearing filters or search.</p>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={onClear}>Clear filters</Button>
          <Link href="/giftlist">
            <Button className="bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]">Go to Gift List</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
