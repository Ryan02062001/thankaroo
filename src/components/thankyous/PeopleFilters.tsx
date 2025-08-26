"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import type { StatusFilter } from "./types";

export function PeopleFilters({
  pendingCount,
  sentCount,
  statusFilter,
  setStatusFilter,
  query,
  setQuery,
}: {
  pendingCount: number; // number of people with no thank-yous yet
  sentCount: number;    // number of people with at least one thank-you sent
  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;
  query: string;
  setQuery: (q: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sentCount})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people…"
        />
      </div>
    </>
  );
}
