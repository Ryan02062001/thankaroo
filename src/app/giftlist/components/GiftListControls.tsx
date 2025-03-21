"use client";

import {
  Gift,
  Plus,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  Mail,
  DollarSign,
  Package,
  CheckCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GiftListControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string | null;
  setFilterType: (type: string | null) => void;
  filterThankYou: boolean | null;
  setFilterThankYou: (value: boolean | null) => void;
  sortMethod: string;
  setSortMethod: (method: string) => void;
  resetFilters: () => void;
  exportAsCSV: () => void;
  openAddGift: () => void;
  giftsLength: number;
}

export function GiftListControls({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterThankYou,
  setFilterThankYou,
  setSortMethod,
  resetFilters,
  exportAsCSV,
  openAddGift,
}: GiftListControlsProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
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
            className="flex items-center gap-1 text-[#2d2d2d] border-[#A8E6CF]"
          >
            {filterType === "physical"
              ? "Physical"
              : filterType === "monetary"
              ? "Monetary"
              : "Registry"}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => setFilterType(null)}
            />
          </Badge>
        )}
        {filterThankYou !== null && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-[#2d2d2d] border-[#A8E6CF]"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Filter className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Filter
              <ChevronDown className="ml-2 h-4 w-4 text-[#2d2d2d]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onSelect={() => setFilterType("physical")}>
              <Package className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Physical Gifts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilterType("monetary")}>
              <DollarSign className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Monetary Gifts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilterType("registry")}>
              <Gift className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Registry Gifts
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Sort
              <ChevronDown className="ml-2 h-4 w-4 text-[#2d2d2d]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onSelect={() => setSortMethod("name-asc")}>
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSortMethod("name-desc")}>
              Name (Z-A)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSortMethod("newest")}>
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSortMethod("oldest")}>
              Oldest First
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="sm" onClick={exportAsCSV}>
          <Download className="mr-2 h-4 w-4 text-[#A8E6CF]" />
          Export
        </Button>
        <Button size="sm" className="bg-[#A8E6CF] hover:bg-[#98CFBA] text-[#2d2d2d]" onClick={openAddGift}>
          <Plus className="mr-1 h-4 w-4 text-[#2d2d2d]" />
          Add Gift
        </Button>
      </div>
    </div>
  );
}
