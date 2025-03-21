"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="flex items-center justify-center py-12 md:py-24 lg:py-32 xl:py-36">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Effortlessly track your wedding gifts
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Never forget a thank-you note again. Thankaroo helps you manage all your wedding gifts in one place.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/giftlist">
                <Button size="lg" className="bg-[#A8E6CF] hover:bg-[#98CFBA] text-[#2d2d2d]">
                  Start Tracking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-current">
                See Demo
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-full md:h-[450px] lg:h-[500px] overflow-hidden rounded-lg border bg-background shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E0FFF4] to-[#F0FDFB] flex items-center justify-center">
                <div className="w-[80%] bg-white rounded-lg shadow-lg p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="font-semibold text-lg">Gift Tracker</h3>
                    <span className="text-sm text-muted-foreground">12 gifts tracked</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-md bg-[#E0FFF4] border border-[#A8E6CF]">
                      <div>
                        <p className="font-medium">Sarah & John</p>
                        <p className="text-sm text-muted-foreground">Crystal vase</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-[#3EB489]" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-white border">
                      <div>
                        <p className="font-medium">Michael & Emma</p>
                        <p className="text-sm text-muted-foreground">Kitchen mixer</p>
                      </div>
                      <div className="h-5 w-5 rounded-full border-2 border-muted"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-white border">
                      <div>
                        <p className="font-medium">Aunt Patricia</p>
                        <p className="text-sm text-muted-foreground">$100 gift card</p>
                      </div>
                      <div className="h-5 w-5 rounded-full border-2 border-muted"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
