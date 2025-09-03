"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PlanCard, { type Plan } from "./PlanCard";

export default function PricingTabs({ free, weddingPass }: { free: Plan; weddingPass: Plan }) {
  return (
    <Tabs defaultValue="pay-once" className="w-full">
      <TabsList className="mx-auto w-full max-w-[280px] rounded-full bg-white text-[#2f9c79] border border-[#A8E6CF]/60 p-1 flex">
        <TabsTrigger value="pay-once" className="flex-1 rounded-full px-4 py-1.5 text-gray-700 data-[state=active]:bg-[#E0FFF4] data-[state=active]:text-[#2f9c79]">Plans</TabsTrigger>
      </TabsList>

      <TabsContent value="pay-once" className="mt-6 sm:mt-8">
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          <PlanCard {...free} />
          <PlanCard {...weddingPass} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
