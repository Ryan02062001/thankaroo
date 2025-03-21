"use client";

import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacySection() {
  return (
    <section className="bg-[#F0FDFB] py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-[#E0FFF4] px-3 py-1 text-sm text-[#3EB489]">
                Privacy First
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Your data stays with you
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
               Thankaroo uses local storage to keep your gift information private and secure. Your data never
                leaves your device unless you choose to export it.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Shield className="h-12 w-12 text-[#3EB489]" />
              <div>
                <h3 className="text-lg font-semibold">Data Privacy</h3>
                <p className="text-muted-foreground">
                  No third-party sharing, no cloud storage unless requested.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <div className="rounded-lg border bg-background p-8 shadow-lg">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Export Options</h3>
                <p className="text-muted-foreground">
                  Easily export your gift list as a CSV or PDF for safekeeping or printing.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button variant="outline" className="w-full text-[#3EB489] border-[#3EB489]">
                    CSV Export
                  </Button>
                  <Button className="w-full bg-[#A8E6CF] hover:bg-[#98CFBA] text-white">
                    PDF Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
