"use client";

import { Gift, Mail, Calendar } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[#F0FDFB] py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-[#E0FFF4] px-3 py-1 text-sm text-[#3EB489]">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            How Thankaroo Helps You Track Gifts
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Thankaroo simplifies the process of tracking gifts and sending thank-you notes.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
            <div className="rounded-full bg-[#E0FFF4] p-3">
              <Gift className="h-6 w-6 text-[#3EB489]" />
            </div>
            <h3 className="text-xl font-semibold">Centralized Tracking</h3>
            <p className="text-center text-muted-foreground">
              Track all gifts in one place—registry and non-registry, monetary and physical.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
            <div className="rounded-full bg-[#E0FFF4] p-3">
              <Mail className="h-6 w-6 text-[#3EB489]" />
            </div>
            <h3 className="text-xl font-semibold">Thank-You Management</h3>
            <p className="text-center text-muted-foreground">
              Easily mark which guests have received thank-you notes to avoid missing anyone.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
            <div className="rounded-full bg-[#E0FFF4] p-3">
              <Calendar className="h-6 w-6 text-[#3EB489]" />
            </div>
            <h3 className="text-xl font-semibold">Simple Organization</h3>
            <p className="text-center text-muted-foreground">
              Minimalist, intuitive interface optimized for quick entries during busy events.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
