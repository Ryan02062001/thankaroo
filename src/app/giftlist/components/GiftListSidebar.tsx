// src/app/giftlist/components/GiftListSidebar.tsx
"use client";

import * as React from "react";
import { ListSelector } from "@/components/ui/list-selector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Search,
  Gift as GiftIcon,
  DollarSign,
  Package,
  CheckCircle,
  Mail,
  X,
} from "lucide-react";

type List = { id: string; name: string };

export function GiftListSidebar({
  lists,
  currentListId,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterThankYou,
  setFilterThankYou,
  sortMethod,
  setSortMethod,
  resetFilters,
  openAddGift,
  openReminderSettings,
  stats,
}: {
  lists: List[];
  currentListId: string;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterType: string | null;
  setFilterType: (v: string | null) => void;
  filterThankYou: boolean | null;
  setFilterThankYou: (v: boolean | null) => void;
  sortMethod: string;
  setSortMethod: (v: string) => void;
  resetFilters: () => void;
  openAddGift: () => void;
  openReminderSettings: () => void;
  stats: { total: number; thanked: number; pending: number };
}) {
  const Chip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="inline-flex h-8 items-center rounded-full border px-3 py-1.5 text-sm transition-colors border-gray-200 text-gray-700 hover:bg-gray-50 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 data-[active=true]:border-gray-300"
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      <ListSelector lists={lists} currentListId={currentListId} />

      <Card className="border-gray-100">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-gray-50 py-3">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold text-[#2d2d2d]">{stats.total}</div>
            </div>
            <div className="rounded-lg bg-gray-50 py-3">
              <div className="text-xs text-gray-500">Thanked</div>
              <div className="text-lg font-semibold text-[#2d2d2d]">{stats.thanked}</div>
            </div>
            <div className="rounded-lg bg-gray-50 py-3">
              <div className="text-xs text-gray-500">Pending</div>
              <div className="text-lg font-semibold text-[#2d2d2d]">{stats.pending}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500">Search</div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#2d2d2d]" />
          <Input
            type="search"
            placeholder="Find gifts or guests…"
            className="pl-8 text-[#2d2d2d]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500">Gift Type</div>
          {filterType !== null && (
            <button
              type="button"
              onClick={() => setFilterType(null)}
              className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={filterType === null} onClick={() => setFilterType(null)}>
            All
          </Chip>
          <Chip active={filterType === "non registry"} onClick={() => setFilterType("non registry")}>
            <Package className="mr-1 h-4 w-4" />
            Non Registry
          </Chip>
          <Chip active={filterType === "monetary"} onClick={() => setFilterType("monetary")}>
            <DollarSign className="mr-1 h-4 w-4" />
            Monetary
          </Chip>
          <Chip active={filterType === "registry"} onClick={() => setFilterType("registry")}>
            <GiftIcon className="mr-1 h-4 w-4" />
            Registry
          </Chip>
          <Chip active={filterType === "multiple"} onClick={() => setFilterType("multiple")}>
            <GiftIcon className="mr-1 h-4 w-4" />
            Multiple
          </Chip>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500">Thank You</div>
          {filterThankYou !== null && (
            <button
              type="button"
              onClick={() => setFilterThankYou(null)}
              className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={filterThankYou === null} onClick={() => setFilterThankYou(null)}>
            All
          </Chip>
          <Chip active={filterThankYou === true} onClick={() => setFilterThankYou(true)}>
            <CheckCircle className="mr-1 h-4 w-4" />
            Thanked
          </Chip>
          <Chip active={filterThankYou === false} onClick={() => setFilterThankYou(false)}>
            <Mail className="mr-1 h-4 w-4" />
            Not Yet
          </Chip>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500">Sort</div>
        <Select
          value={sortMethod || undefined}
          onValueChange={(v) => setSortMethod(v === "none" ? "" : v)}
        >
          <SelectTrigger className="text-[#2d2d2d]">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name (A‑Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z‑A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button variant="outline" onClick={openReminderSettings}>Reminders</Button>
        <Button className="bg-gray-900 text-white hover:bg-black" onClick={openAddGift}>
          Add Gift
        </Button>
      </div>

      {(filterType !== null || filterThankYou !== null || searchTerm || sortMethod) && (
        <div>
          <Button variant="ghost" className="px-0 text-sm text-gray-600" onClick={resetFilters}>
            Reset all filters
          </Button>
        </div>
      )}
    </div>
  );
}