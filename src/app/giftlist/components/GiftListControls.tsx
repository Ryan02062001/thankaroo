"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  Mail,
  DollarSign,
  Package,
  Gift as GiftIcon,
  CheckCircle,
  Plus,
} from "lucide-react";
import * as React from "react";
import { ListSelector } from "@/components/ui/list-selector";

type List = { id: string; name: string };

export function GiftListControls({
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
  openAddReminder,
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
  openAddReminder: () => void;
}) {
  const sortLabel = React.useMemo(() => {
    switch (sortMethod) {
      case "name-asc":
        return "Name (A‑Z)";
      case "name-desc":
        return "Name (Z‑A)";
      case "newest":
        return "Newest";
      case "oldest":
        return "Oldest";
      default:
        return "";
    }
  }, [sortMethod]);

  // Measure primary width (Select + New List + Rename) to match search
  const [primaryWidth, setPrimaryWidth] = React.useState<number>(256);

  const FilterButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4 text-[#2d2d2d]" />
          Filter
          <ChevronDown className="ml-2 h-4 w-4 text-[#2d2d2d]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuItem onSelect={() => setFilterType("non registry")}>
          <Package className="mr-2 h-4 w-4 text-[#2d2d2d]" />
          Non Registry Gifts
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setFilterType("monetary")}>
          <DollarSign className="mr-2 h-4 w-4 text-[#2d2d2d]" />
          Monetary Gifts
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setFilterType("registry")}>
          <GiftIcon className="mr-2 h-4 w-4 text-[#2d2d2d]" />
          Registry Gifts
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setFilterType("multiple")}>
          <GiftIcon className="mr-2 h-4 w-4 text-[#2d2d2d]" />
          Multiple Gifts
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setFilterThankYou(true)}>
          <CheckCircle className="mr-2 h-4 w-4 text-[#2d2d2d]" />
          Thanked
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setFilterThankYou(false)}>
          <Mail className="mr-2 h-4 w-4 text-[#2d2d2d]" />
          Not Thanked
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const SortButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="mr-2 h-4 w-4 text-[#2d2d2d]" />
          Sort
          {sortLabel ? (
            <span className="ml-1 text-xs text-[#2d2d2d]/70">({sortLabel})</span>
          ) : null}
          <ChevronDown className="ml-2 h-4 w-4 text-[#2d2d2d]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuRadioGroup value={sortMethod} onValueChange={setSortMethod}>
          <DropdownMenuRadioItem value="">None</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name-asc">Name (A‑Z)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name-desc">Name (Z‑A)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-w-0">
      <div className="inline-flex flex-col gap-3">
        {/* Row 1: selector + actions (we measure only the primary trio) */}
        <div className="inline-block">
          <ListSelector
            lists={lists}
            currentListId={currentListId}
            className="mb-0"
            onPrimaryWidth={setPrimaryWidth}
          >
            <Button size="sm" variant="outline" onClick={openAddReminder}>
              + Add Reminder
            </Button>
            <Button
              size="sm"
              className="bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]"
              onClick={openAddGift}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Gift
            </Button>
          </ListSelector>
        </div>

        {/* Row 2: search (same width on md+) + Filter + chips that push Sort */}
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <div className="relative w-full md:w-auto" style={{ width: primaryWidth }}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#2d2d2d]" />
            <Input
              type="search"
              placeholder="Search gifts or guests..."
              className="w-full pl-8 text-[#2d2d2d]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter button + chips live together and can scroll horizontally */}
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap">
            {FilterButton}

            {filterType && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-[#A8E6CF] text-[#2d2d2d]"
              >
                {filterType === "non registry"
                  ? "Non Registry"
                  : filterType === "monetary"
                  ? "Monetary"
                  : filterType === "registry"
                  ? "Registry"
                  : "Multiple"}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterType(null)} />
              </Badge>
            )}

            {filterThankYou !== null && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-[#A8E6CF] text-[#2d2d2d]"
              >
                {filterThankYou ? "Thanked" : "Not Thanked"}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilterThankYou(null)}
                />
              </Badge>
            )}

            {(filterType || filterThankYou !== null) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Sort stays at the far right and is pushed by chips */}
          <div className="shrink-0">{SortButton}</div>
        </div>
      </div>
    </div>
  );
}