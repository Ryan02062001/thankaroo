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

export function GiftListControls({
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
}: {
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

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#2d2d2d]" />
        <Input
          type="search"
          placeholder="Search gifts or guests..."
          className="pl-8 text-[#2d2d2d]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => setFilterType(null)}
            />
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

        {/* Filter menu */}
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

        {/* Sort menu with radio group so `sortMethod` is read */}
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
            <DropdownMenuRadioGroup
              value={sortMethod}
              onValueChange={setSortMethod}
            >
              <DropdownMenuRadioItem value="">
                None
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name-asc">
                Name (A‑Z)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name-desc">
                Name (Z‑A)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="newest">
                Newest First
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">
                Oldest First
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          className="bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]"
          onClick={openAddGift}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Gift
        </Button>
      </div>
    </div>
  );
}
