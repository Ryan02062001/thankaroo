// src/components/QuotaBanner.tsx
"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";

export function useBillingSummary() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<
    | {
        plan: "free" | "wedding" | "pro";
        limits: { maxLists: number | null; maxGiftsPerList: number | null; maxAiDraftsPerMonth: number | null };
        usage: { aiDraftsThisMonth: number; listsCount: number };
      }
    | null
  >(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/summary", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { loading, error, data, refresh } as const;
}

export function QuotaBanner({
  context,
  listGiftCount,
}: {
  context: "lists" | "gifts" | "ai";
  listGiftCount?: number; // current list's gift count for gifts context
}) {
  const { data } = useBillingSummary();
  if (!data) return null;

  const { plan, limits, usage } = data;

  const render = () => {
    if (context === "lists") {
      if (typeof limits.maxLists === "number") {
        const used = usage.listsCount;
        const remaining = Math.max(0, limits.maxLists - used);
        const near = remaining <= 1;
        if (remaining === 0) {
          return (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              You have reached your list limit on the {plan} plan. Upgrade to add more.
            </div>
          );
        }
        if (near) {
          return (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {remaining} list left on the {plan} plan.
            </div>
          );
        }
      }
      return null;
    }

    if (context === "gifts") {
      if (typeof limits.maxGiftsPerList === "number") {
        const used = listGiftCount ?? 0;
        const remaining = Math.max(0, limits.maxGiftsPerList - used);
        const near = remaining <= 5;
        if (remaining === 0) {
          return (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              This list has reached the gift limit on the {plan} plan. Upgrade to add more.
            </div>
          );
        }
        if (near) {
          return (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {remaining} gifts left for this list on the {plan} plan.
            </div>
          );
        }
      }
      return null;
    }

    // ai
    if (typeof limits.maxAiDraftsPerMonth === "number") {
      const used = usage.aiDraftsThisMonth;
      const remaining = Math.max(0, limits.maxAiDraftsPerMonth - used);
      const near = remaining <= 3;
      if (remaining === 0) {
        return (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            You have reached your monthly AI draft limit on the {plan} plan.
          </div>
        );
      }
      if (near) {
        return (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center gap-2">
            <Info className="h-4 w-4" />
            {remaining} AI drafts left this month on the {plan} plan.
          </div>
        );
      }
    }
    return null;
  };

  return <>{render()}</>;
}


