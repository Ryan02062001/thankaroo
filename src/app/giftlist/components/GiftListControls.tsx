"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ListSelector } from "@/components/ui/list-selector";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  Package,
  DollarSign,
  Gift as GiftIcon,
  Layers,
  CheckCircle,
  Mail,
  X,
} from "lucide-react";

type List = { id: string; name: string };
type GiftType = "non registry" | "monetary" | "registry" | "multiple";

const TYPE_META: Record<
  GiftType,
  { label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }
> = {
  "non registry": { label: "Non-registry", Icon: Package },
  monetary: { label: "Monetary", Icon: DollarSign },
  registry: { label: "Registry", Icon: GiftIcon },
  multiple: { label: "Multiple", Icon: Layers },
};

export function GiftListControls({
  lists,
  currentListId,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterThankYou,
  setFilterThankYou,
  filterHasNote,
  setFilterHasNote,
  sortMethod,
  setSortMethod,
  resetFilters,
  openAddGift,
}: {
  lists: List[];
  currentListId: string;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterType: GiftType | null;
  setFilterType: (v: GiftType | null) => void;
  filterThankYou: boolean | null;
  setFilterThankYou: (v: boolean | null) => void;
  filterHasNote: boolean | null;
  setFilterHasNote: (v: boolean | null) => void;
  sortMethod: string;
  setSortMethod: (v: string) => void;
  resetFilters: () => void;
  openAddGift: () => void;
  openAddReminder: () => void; // kept for compatibility
}) {
  const [primaryWidth, setPrimaryWidth] = React.useState<number>(320);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);

  const sortLabel = React.useMemo(() => {
    switch (sortMethod) {
      case "name-asc":
        return "Name (A-Z)";
      case "name-desc":
        return "Name (Z-A)";
      case "newest":
        return "Newest first";
      case "oldest":
        return "Oldest first";
      default:
        return "None";
    }
  }, [sortMethod]);

  const hasFilters = !!filterType || filterThankYou !== null || filterHasNote !== null;

  // ——— Helpers ———
  const FilterChip = ({
    children,
    onClear,
  }: {
    children: React.ReactNode;
    onClear: () => void;
  }) => (
    <Badge
      variant="outline"
      className="flex items-center gap-1 border-[#A8E6CF] bg-[#A8E6CF]/10 text-[#1f2937]"
    >
      {children}
      <button
        type="button"
        aria-label="Clear filter"
        className="rounded p-0.5 hover:bg-black/5"
        onClick={onClear}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );

  // Keyboard shortcuts: / focus search, F = filters, S = sort
  const searchRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const typingInField = tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable;

      if (!typingInField && e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (!typingInField && (e.key === "f" || e.key === "F")) {
        setFiltersOpen((v) => !v);
      }
      if (!typingInField && (e.key === "s" || e.key === "S")) {
        setSortOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setFiltersOpen(false);
        setSortOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TooltipProvider delayDuration={120}>
      <div className="w-full">
        <div className="flex flex-col gap-3">
          {/* Row 1: List + primary action */}
          <div className="inline-block">
            <ListSelector
              lists={lists}
              currentListId={currentListId}
              className="mb-0"
              onPrimaryWidth={setPrimaryWidth}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-9 bg-[#A8E6CF] text-[#1f2937] hover:bg-[#98CFBA]"
                    onClick={openAddGift}
                    aria-label="Add gift"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add gift
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add a new gift to this list</TooltipContent>
              </Tooltip>
            </ListSelector>
          </div>

          {/* Row 1.5: friendly tip line */}
          <p className="text-xs text-gray-500 pl-[2px]">
            Tip: press <kbd className="px-1 py-0.5 rounded border text-[10px]">/</kbd> to search,&nbsp;
            <kbd className="px-1 py-0.5 rounded border text-[10px]">F</kbd> to open filters,&nbsp;
            <kbd className="px-1 py-0.5 rounded border text-[10px]">S</kbd> to sort.
          </p>

          {/* Row 2: Search + Filters + Sort */}
          <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
            <div className="relative w-full md:w-auto" style={{ width: primaryWidth }}>
              <Label htmlFor="gift-search" className="sr-only">
                Search gifts or guests
              </Label>
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                ref={searchRef}
                id="gift-search"
                type="search"
                placeholder="Search gifts or guests…"
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-describedby="search-help"
              />
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2">
              {/* Filters */}
              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9" aria-label="Open filters">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-[560px] max-w-[90vw] p-5" sideOffset={8}>
                  <div className="space-y-5">
                    {/* Type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Gift type</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {(Object.keys(TYPE_META) as GiftType[]).map((t) => {
                          const { label, Icon } = TYPE_META[t];
                          const active = filterType === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setFilterType(active ? null : t)}
                              aria-pressed={active}
                              className={[
                                "flex w-full items-center gap-4 rounded-xl border px-4 h-20 text-left transition-all",
                                active
                                  ? "border-[#A8E6CF] bg-[#A8E6CF]/15 shadow-sm"
                                  : "border-gray-200 hover:border-gray-300",
                              ].join(" ")}
                            >
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#A8E6CF]/20">
                                <Icon className="h-5 w-5 text-gray-700" />
                              </span>
                              <span className="font-medium text-gray-800 whitespace-nowrap">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Thanked tri-state */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Thank you status</Label>
                      <div className="inline-flex overflow-hidden rounded-full border border-gray-200 bg-white">
                        <button
                          type="button"
                          className={["px-3 py-1.5 text-sm", filterThankYou === null ? "bg-gray-50 font-medium" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterThankYou(null)}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          className={["inline-flex items-center gap-1 px-3 py-1.5 text-sm", filterThankYou === true ? "bg-[#A8E6CF]/30 font-medium" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterThankYou(true)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Yes
                        </button>
                        <button
                          type="button"
                          className={["inline-flex items-center gap-1 px-3 py-1.5 text-sm", filterThankYou === false ? "bg-[#A8E6CF]/30 font-medium" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterThankYou(false)}
                        >
                          <Mail className="h-4 w-4" />
                          No
                        </button>
                      </div>
                    </div>

                    {/* Note tri-state */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Has note</Label>
                      <div className="inline-flex overflow-hidden rounded-full border border-gray-200 bg-white">
                        <button
                          type="button"
                          className={["px-3 py-1.5 text-sm", filterHasNote === null ? "bg-gray-50 font-medium" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterHasNote(null)}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          className={["px-3 py-1.5 text-sm", filterHasNote === true ? "bg-[#A8E6CF]/30 font-medium" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterHasNote(true)}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={["px-3 py-1.5 text-sm", filterHasNote === false ? "bg-[#A8E6CF]/30 font-medium" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterHasNote(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-gray-500">Tip: you can combine filters</span>
                      {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>
                          Reset all
                        </Button>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sort */}
              <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9" aria-label="Change sort">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Sort
                    <span className="ml-1 text-xs text-gray-600">({sortLabel})</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px]">
                  <DropdownMenuRadioGroup value={sortMethod} onValueChange={setSortMethod}>
                    <DropdownMenuRadioItem value="">None</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="grow" />
            </div>
          </div>

          {/* Row 3: Active filter chips + quick clear */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {filterType && (
                <FilterChip onClear={() => setFilterType(null)}>
                  {TYPE_META[filterType].label}
                </FilterChip>
              )}
              {filterThankYou !== null && (
                <FilterChip onClear={() => setFilterThankYou(null)}>
                  Thanked: {filterThankYou ? "Yes" : "No"}
                </FilterChip>
              )}
              {filterHasNote !== null && (
                <FilterChip onClear={() => setFilterHasNote(null)}>
                  Has note: {filterHasNote ? "Yes" : "No"}
                </FilterChip>
              )}
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
