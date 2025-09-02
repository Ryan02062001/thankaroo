"use client";

import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export type Plan = {
  name: string;
  tagline: string;
  price: string;
  priceNote?: string;
  ctaLabel: string;
  ctaHref: string;
  mostPopular?: boolean;
  oneTime?: boolean;
  features: string[];
  ctaOnClick?: () => void;
};

export default function PlanCard(p: Plan) {
  return (
    <Card
      className={[
        "flex flex-col rounded-3xl border-2 text-gray-900 bg-white shadow-xl",
        // Make cards shrink to fit tighter side-by-side
        "w-full min-w-[14rem] sm:min-w-[18rem]",
        p.mostPopular ? "border-emerald-400/60 ring-emerald-400/40" : "border-gray-200",
      ].join(" ")}
    >
      <CardHeader className="pt-6 pb-4 px-6 sm:pt-8 sm:pb-6 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-xl sm:text-2xl text-gray-900">{p.name}</CardTitle>
            <CardDescription className="mt-1 text-gray-600">{p.tagline}</CardDescription>
          </div>
          {p.mostPopular && (
            <Badge className="bg-[#E0FFF4] text-[#2f9c79] border border-[#A8E6CF] px-2 py-1 text-xs sm:text-sm whitespace-nowrap">
              Most popular
            </Badge>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="text-4xl sm:text-5xl font-bold text-gray-900">{p.price}</div>
          {p.priceNote && <div className="text-sm text-gray-500">{p.priceNote}</div>}
          {p.oneTime && (
            <div className="ml-0 sm:ml-2 text-xs rounded bg-gray-100 px-2 py-1 text-gray-600">One-time</div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-4 sm:px-8 sm:pb-6">
        <ul className="space-y-2">
          {p.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="mt-0.5 h-4 w-4 text-[#3EB489] shrink-0" />
              <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="mt-auto px-6 pb-6 sm:px-8">
        {p.ctaOnClick ? (
          <Button size="lg" className="w-full h-12 bg-[#3EB489] hover:bg-[#2d9970] text-white" onClick={p.ctaOnClick}>
            {p.ctaLabel}
          </Button>
        ) : (
          <Link href={p.ctaHref} className="w-full">
            <Button size="lg" className="w-full h-12 bg-[#3EB489] hover:bg-[#2d9970] text-white">
              {p.ctaLabel}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
