// src/app/settings/page.tsx
import { createClient } from "@/utils/supabase/server";
import { getCurrentPlanForUser } from "@/lib/plans";
import Link from "next/link";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return (
      <div className="min-h-screen bg-[#fefefe] pt-20">
        <main className="mx-auto w-full px-6 py-10">
          <div className="rounded border bg-white p-6 text-[#2d2d2d]">
            Please <Link href="/signin" className="underline">sign in</Link>.
          </div>
        </main>
      </div>
    );
  }

  const { plan, limits } = await getCurrentPlanForUser();

  return (
    <div className="min-h-screen bg-[#fefefe] pt-20">
      <main className="mx-auto w-full max-w-3xl px-6 py-10 space-y-6">
        <h1 className="text-2xl font-semibold text-[#2d2d2d]">Account & Billing</h1>

        <div className="rounded border bg-white p-6 text-[#2d2d2d] space-y-3">
          <div className="text-sm text-gray-600">Current plan</div>
          <div className="text-lg font-medium capitalize">{plan === "wedding" ? "Wedding Pass (one-time)" : plan}</div>
          <div className="text-sm text-gray-600">
            {plan === "free" && "Includes up to 1 list, 100 gifts per list, 10 AI drafts/month."}
            {plan === "wedding" && "Includes 3 lists, unlimited gifts, 100 AI drafts/month."}
            {plan === "pro" && "Unlimited lists & gifts; generous AI allowance."}
          </div>
          <form method="POST" action="/api/stripe/create-portal-session">
            <button className="mt-2 inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
              Open Billing Portal
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}


