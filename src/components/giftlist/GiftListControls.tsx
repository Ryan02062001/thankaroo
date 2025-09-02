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
  Upload,
  Download,
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
  openAddReminder, // kept for compatibility
  onTriggerImport,
  onExportCSV,
  importBusy,
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
  openAddReminder: () => void;
  onTriggerImport: () => void;
  onExportCSV: () => void;
  importBusy: boolean;
}) {
  const [primaryWidth, setPrimaryWidth] = React.useState<number>(360);

  // Maintain separate open states per breakpoint to avoid hidden overlays capturing clicks
  const [filtersOpenMobile, setFiltersOpenMobile] = React.useState(false);
  const [sortOpenMobile, setSortOpenMobile] = React.useState(false);
  const [filtersOpenDesktop, setFiltersOpenDesktop] = React.useState(false);
  const [sortOpenDesktop, setSortOpenDesktop] = React.useState(false);

  // Track current breakpoint to direct keyboard shortcuts appropriately
  const [isMdUp, setIsMdUp] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMdUp(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

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

  React.useEffect(() => {}, [openAddReminder]);

  const FilterChip = ({
    children,
    onClear,
  }: {
    children: React.ReactNode;
    onClear: () => void;
  }) => (
    <Badge
      variant="outline"
      className="flex items-center gap-1 rounded-xl border-[#A8E6CF] bg-[#A8E6CF]/30 text-[#2f9c79]"
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

  const searchRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const typingInField =
        tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable;

      if (!typingInField && e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (!typingInField && (e.key === "f" || e.key === "F")) {
        if (isMdUp) setFiltersOpenDesktop((v) => !v);
        else setFiltersOpenMobile((v) => !v);
      }
      if (!typingInField && (e.key === "s" || e.key === "S")) {
        if (isMdUp) setSortOpenDesktop((v) => !v);
        else setSortOpenMobile((v) => !v);
      }
      if (e.key === "Escape") {
        setFiltersOpenMobile(false);
        setSortOpenMobile(false);
        setFiltersOpenDesktop(false);
        setSortOpenDesktop(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMdUp]);

  const CONTROL_H = "h-12";
  const UNIFORM_W = "w-full sm:w-[176px]";
  const BTN_BASE = `${CONTROL_H} ${UNIFORM_W} rounded-xl border-gray-200 bg-white hover:bg-gray-50 px-4`;
  const filterBtnClassMobile =
    (filtersOpenMobile || hasFilters)
      ? `${CONTROL_H} ${UNIFORM_W} rounded-xl border-[#A8E6CF] bg-white text-[#2f9c79] ring-2 ring-[#A8E6CF] px-4`
      : BTN_BASE;
  const filterBtnClassDesktop =
    (filtersOpenDesktop || hasFilters)
      ? `${CONTROL_H} ${UNIFORM_W} rounded-xl border-[#A8E6CF] bg-white text-[#2f9c79] ring-2 ring-[#A8E6CF] px-4`
      : BTN_BASE;

  return (
    <TooltipProvider delayDuration={120}>
      <div className="w-full">
        <div className="flex flex-col">
          {/* Mobile-first layout based on mockup */}
          <div className="md:hidden">
            {/* Row 1: List dropdown, New List, Rename */}
            <ListSelector
              lists={lists}
              currentListId={currentListId}
              mobileThreeCol
              className={`
                mb-0
                [&_button:not(.brand-btn)]:${CONTROL_H}
                [&_button:not(.brand-btn)]:${UNIFORM_W}
                [&_button:not(.brand-btn)]:rounded-xl
                [&_button:not(.brand-btn)]:px-4
              `}
              onPrimaryWidth={setPrimaryWidth}
            />

            {/* Row 2: Search full-width */}
            <div className="mt-2">
              <div className="relative">
                <Label htmlFor="gift-search-mobile" className="sr-only">
                  Search gifts or guests
                </Label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  ref={searchRef}
                  id="gift-search-mobile"
                  type="search"
                  placeholder="Search gifts or guests…"
                  className={`${CONTROL_H} w-full rounded-xl border-gray-200 bg-gray-50 pl-10 pr-4 text-[15px] focus-visible:ring-2 focus-visible:ring-[#3EB489] focus-visible:ring-offset-2`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-describedby="search-help"
                />
              </div>
            </div>

            {/* Row 3: Filters and Sort side-by-side */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Popover open={filtersOpenMobile} onOpenChange={setFiltersOpenMobile}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={filterBtnClassMobile} aria-label="Open filters">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[640px] max-w-[92vw] rounded-2xl border border-gray-200 p-6 shadow-xl"
                  sideOffset={8}
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-800">Gift type</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(TYPE_META) as GiftType[]).map((t) => {
                          const { label } = TYPE_META[t];
                          const active = filterType === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setFilterType(active ? null : t)}
                              aria-pressed={active}
                              className={[
                                "flex h-16 sm:h-20 w-full items-center gap-3 sm:gap-4 rounded-xl border px-4 sm:px-5 text-left transition-all",
                                active
                                  ? "border-[#3EB489] bg-[#A8E6CF]/60 shadow-sm"
                                  : "border-gray-200 hover:border-gray-300",
                              ].join(" ")}
                            >
                              <span className="whitespace-nowrap font-medium text-gray-900">
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-800">Thank you status</Label>
                      <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <button
                          type="button"
                          className={["px-3.5 py-1.5 text-sm", filterThankYou === null ? "bg-gray-50 font-medium" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterThankYou(null)}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          className={["inline-flex items-center gap-1 px-3.5 py-1.5 text-sm", filterThankYou === true ? "bg-[#A8E6CF]/60 font-medium text-[#2f9c79]" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterThankYou(true)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Yes
                        </button>
                        <button
                          type="button"
                          className={["inline-flex items-center gap-1 px-3.5 py-1.5 text-sm", filterThankYou === false ? "bg-[#A8E6CF]/60 font-medium text-[#2f9c79]" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterThankYou(false)}
                        >
                          <Mail className="h-4 w-4" />
                          No
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-800">Has note</Label>
                      <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <button
                          type="button"
                          className={["px-3.5 py-1.5 text-sm", filterHasNote === null ? "bg-gray-50 font-medium" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterHasNote(null)}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          className={["px-3.5 py-1.5 text-sm", filterHasNote === true ? "bg-[#A8E6CF]/60 font-medium text-[#2f9c79]" : "hover:bg-gray-50"].join(" ")}
                          onClick={() => setFilterHasNote(true)}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={["px-3.5 py-1.5 text-sm", filterHasNote === false ? "bg-[#A8E6CF]/60 font-medium text-[#2f9c79]" : "hover:bg-gray-50"].join(" ")}
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

              <DropdownMenu open={sortOpenMobile} onOpenChange={setSortOpenMobile}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={BTN_BASE} aria-label="Change sort">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    <span className="truncate">
                      Sort <span className="ml-1 text-xs text-gray-600">({sortLabel})</span>
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[240px]">
                  <DropdownMenuRadioGroup value={sortMethod} onValueChange={setSortMethod}>
                    <DropdownMenuRadioItem value="">None</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Row 4: Add Gift full-width */}
            <div className="mt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className={`brand-btn ${CONTROL_H} w-full rounded-xl bg-[#3EB489] px-5 text-white hover:bg-[#2f9c79] focus-visible:ring-2 focus-visible:ring-[#3EB489] focus-visible:ring-offset-2`}
                    onClick={openAddGift}
                    aria-label="Add gift"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Gift
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add a new gift to this list</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Desktop / tablet layout preserved */}
          <div className="hidden md:block">
            <div className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap md:items-center md:justify-between gap-2 md:gap-3">
              <ListSelector
                lists={lists}
                currentListId={currentListId}
                className={`
                  mb-0
                  [&_button:not(.brand-btn)]:${CONTROL_H}
                  [&_button:not(.brand-btn)]:${UNIFORM_W}
                  [&_button:not(.brand-btn)]:rounded-xl
                  [&_button:not(.brand-btn)]:px-4
                `}
                onPrimaryWidth={setPrimaryWidth}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className={`brand-btn ${CONTROL_H} ${UNIFORM_W} rounded-xl bg-[#3EB489] px-5 text-white hover:bg-[#2f9c79] focus-visible:ring-2 focus-visible:ring-[#3EB489] focus-visible:ring-offset-2`}
                    onClick={openAddGift}
                    aria-label="Add gift"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Gift
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add a new gift to this list</TooltipContent>
              </Tooltip>

                {/* Import / Export kept for desktop */}
              <Button
                variant="outline"
                size="sm"
                className={`${CONTROL_H} ${UNIFORM_W} rounded-xl border-[#A8E6CF] text-[#2f9c79] hover:bg-[#A8E6CF]/30`}
                onClick={onTriggerImport}
                disabled={importBusy}
                aria-label="Import gifts from CSV"
                title="Import gifts from CSV"
              >
                <Upload className="mr-2 h-4 w-4" />
                {importBusy ? "Importing…" : "Import CSV"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${CONTROL_H} ${UNIFORM_W} rounded-xl border-[#A8E6CF] text-[#2f9c79] hover:bg-[#A8E6CF]/30`}
                onClick={onExportCSV}
                aria-label="Export gifts to CSV"
                title="Export current list to CSV"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </ListSelector>
          </div>

          <div className="-mx-6 my-4 hidden h-px bg-gray-200 md:block md:-mx-8" aria-hidden="true" />

          <div className="hidden md:flex md:flex-row items-stretch md:items-center gap-2 md:gap-3">
            <div className="relative flex-1">
              <Label htmlFor="gift-search" className="sr-only">
                Search gifts or guests
              </Label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                ref={searchRef}
                id="gift-search"
                type="search"
                placeholder="Search gifts or guests…"
                className={`${CONTROL_H} w-full rounded-xl border-gray-200 bg-gray-50 pl-10 pr-4 text-[15px] focus-visible:ring-2 focus-visible:ring-[#3EB489] focus-visible:ring-offset-2`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-describedby="search-help"
                style={{ minWidth: Math.min(primaryWidth, 360) }}
              />
            </div>

            <Popover open={filtersOpenDesktop} onOpenChange={setFiltersOpenDesktop}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={filterBtnClassDesktop} aria-label="Open filters">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-[640px] max-w-[92vw] rounded-2xl border border-gray-200 p-6 shadow-xl"
                sideOffset={8}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-800">Gift type</Label>
                    <div className="grid grid-cols-2 gap-4">
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
                              "flex h-20 w-full items-center gap-4 rounded-xl border px-5 text-left transition-all",
                              active
                                ? "border-[#3EB489] bg-[#A8E6CF]/60 shadow-sm"
                                : "border-gray-200 hover:border-gray-300",
                            ].join(" ")}
                          >
                            <span className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#A8E6CF]">
                              <Icon className="h-5 w-5 text-[#2f9c79]" />
                            </span>
                            <span className="whitespace-nowrap font-medium text-gray-900">
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-800">Thank you status</Label>
                    <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <button
                        type="button"
                        className={["px-3.5 py-1.5 text-sm", filterThankYou === null ? "bg-gray-50 font-medium" : "hover:bg-gray-50"].join(" ")}
                        onClick={() => setFilterThankYou(null)}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={["inline-flex items-center gap-1 px-3.5 py-1.5 text-sm", filterThankYou === true ? "bg-[#A8E6CF]/60 font-medium text-[#2f9c79]" : "hover:bg-gray-50"].join(" ")}
                        onClick={() => setFilterThankYou(true)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Yes
                      </button>
                      <button
                        type="button"
                        className={["inline-flex items-center gap-1 px-3.5 py-1.5 text-sm", filterThankYou === false ? "bg-[#A8E6CF]/60 font-medium text-[#2f9c79]" : "hover:bg-gray-50"].join(" ")}
                        onClick={() => setFilterThankYou(false)}
                      >
                        <Mail className="h-4 w-4" />
                        No
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-800">Has note</Label>
                    <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <button
                        type="button"
                        className={["px-3.5 py-1.5 text-sm", filterHasNote === null ? "bg-gray-50 font-medium" : "hover:bg-gray-50"].join(" ")}
                        onClick={() => setFilterHasNote(null)}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={["px-3.5 py-1.5 text-sm", filterHasNote === true ? "bg-[#A8E6CF]/60 font-medium text-[#2f9c79]" : "hover:bg-gray-50"].join(" ")}
                        onClick={() => setFilterHasNote(true)}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={["px-3.5 py-1.5 text-sm", filterHasNote === false ? "bg-[#A8E6CF]/60 font-medium text-[#2f9c79]" : "hover:bg-gray-50"].join(" ")}
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

            <DropdownMenu open={sortOpenDesktop} onOpenChange={setSortOpenDesktop}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={BTN_BASE} aria-label="Change sort">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    Sort <span className="ml-1 text-xs text-gray-600">({sortLabel})</span>
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px]">
                <DropdownMenuRadioGroup value={sortMethod} onValueChange={setSortMethod}>
                  <DropdownMenuRadioItem value="">None</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>

          <div className="-mx-6 my-4 hidden h-px bg-gray-200 md:block md:-mx-8" aria-hidden="true" />

          <p className="pl-0 text-xs text-gray-500 hidden sm:block">
            Tip: Press <kbd className="rounded border px-1 py-0.5 text-[10px]">/</kbd> to search,&nbsp;
            <kbd className="rounded border px-1 py-0.5 text-[10px]">F</kbd> to open filters,&nbsp;
            <kbd className="rounded border px-1 py-0.5 text-[10px]">S</kbd> to sort.
          </p>

          {hasFilters && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
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
