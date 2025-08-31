"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ChannelFilter = "all" | "email" | "text" | "card";

export default function FiltersBar({
  pendingOnly,
  setPendingOnly,
  channelFilter,
  setChannelFilter,
  search,
  setSearch,
}: {
  pendingOnly: boolean;
  setPendingOnly: (v: boolean) => void;
  channelFilter: ChannelFilter;
  setChannelFilter: (v: ChannelFilter) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const chipClass = (active: boolean) =>
    [
      "inline-flex items-center rounded-lg border px-4 py-2 text-base h-11 transition-colors",
      active
        ? "bg-slate-100 text-slate-900 border-slate-300 shadow-inner"
        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
    ].join(" ");

  const CHANNELS = React.useMemo(
    () => [
      { key: "all" as const, label: "All" },
      { key: "email" as const, label: "Email" },
      { key: "text" as const, label: "Text" },
      { key: "card" as const, label: "Card" },
    ],
    []
  );

  return (
    <div className="mb-5 flex flex-wrap items-center gap-4">
      <Button
        size="lg"
        variant="outline"
        className={`${chipClass(pendingOnly)} rounded-lg`}
        onClick={() => setPendingOnly(!pendingOnly)}
      >
        {pendingOnly ? "Pending only" : "All reminders"}
      </Button>
      <div className="flex items-center gap-3 text-base overflow-x-auto whitespace-nowrap">
        <span className="text-[#2d2d2d] mr-1 inline-flex items-center h-11">Channel:</span>
        <Tabs value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelFilter)} className="gap-0">
          <TabsList className="rounded-lg h-11 p-1.5  bg-white border border-slate-200 shadow-sm">
            {CHANNELS.map((c) => (
              <TabsTrigger key={c.key} value={c.key} className="rounded-md px-4 text-base h-9">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <input
        placeholder="Search…"
        className="h-11 rounded-lg border border-slate-200 px-4 text-base bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
