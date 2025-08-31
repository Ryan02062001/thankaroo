"use client";

import { Button } from "@/components/ui/button";

export default function BillingStatusBanner({ success, canceled, sessionId }: { success: boolean; canceled: boolean; sessionId?: string }) {
  if (!success && !canceled) return null;
  return (
    <div className="mx-auto mb-6 max-w-2xl">
      {success && (
        <div className="rounded-md border border-[#A8E6CF]/60 bg-[#E0FFF4] p-4 text-[#2f9c79]">
          Subscription successful!
          {sessionId && (
            <form method="POST" action="/api/stripe/create-portal-session" className="mt-3">
              <input type="hidden" name="session_id" value={sessionId} />
              <Button className="bg-[#3EB489] hover:bg-[#2d9970] text-white">Manage your billing</Button>
            </form>
          )}
        </div>
      )}
      {canceled && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Checkout canceled — you can try again anytime.
        </div>
      )}
    </div>
  );
}
