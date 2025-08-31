"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PlanCard, { type Plan } from "./PlanCard";

export default function PricingTabs({ free, weddingPass, proMonthly, proAnnual }: { free: Plan; weddingPass: Plan; proMonthly: Plan; proAnnual: Plan }) {
  return (
    <Tabs defaultValue="pay-once" className="w-full">
      <TabsList className="mx-auto w-full max-w-[420px] rounded-full bg-white text-[#2f9c79] border border-[#A8E6CF]/60 p-1 flex">
        <TabsTrigger value="pay-once" className="flex-1 rounded-full px-4 py-1.5 text-gray-700 data-[state=active]:bg-[#E0FFF4] data-[state=active]:text-[#2f9c79]">Pay once</TabsTrigger>
        <TabsTrigger value="subscribe" className="flex-1 rounded-full px-4 py-1.5 text-gray-700 data-[state=active]:bg-[#E0FFF4] data-[state=active]:text-[#2f9c79]">Subscribe</TabsTrigger>
      </TabsList>

      <TabsContent value="pay-once" className="mt-6 sm:mt-8">
        <div className="mx-auto justify-items-center grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <PlanCard {...free} />
          <PlanCard {...weddingPass} />
        </div>
      </TabsContent>

      <TabsContent value="subscribe" className="mt-6 sm:mt-8">
        <div className="mx-auto justify-items-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <PlanCard {...free} />
          <PlanCard {...proMonthly} />
          <PlanCard {...proAnnual} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
