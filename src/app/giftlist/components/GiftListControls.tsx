// src/components/GiftListControls.tsx
"use client";

import { useRef } from "react";
import Papa from "papaparse";
import { useGifts, GiftItem, GiftType } from "@/app/contexts/GiftContext";
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
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const { importGifts } = useGifts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse with PapaParse to guarantee correct columns
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const items: Omit<GiftItem, "id">[] = results.data.map((row) => {
          const G = row["Guest Name"]?.trim() || "";
          const D = row["Gift Description"]?.trim() || "";
          const T = (row["Type"]?.trim() as GiftType) || "non registry";
          const Dt = row["Date Received"]?.trim() || "";
          const Y = row["Thank You Sent"]?.trim().toLowerCase().startsWith("y");

          const type: GiftType = ["non registry", "monetary", "registry", "multiple"].includes(T)
            ? T
            : "non registry";

          const date = /^\d{4}-\d{2}-\d{2}$/.test(Dt) ? Dt : new Date().toISOString().split("T")[0];

          return { guestName: G, description: D, type, date, thankYouSent: Y };
        });
        importGifts(items);
      },
    });
    e.target.value = "";
  };

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
          <Badge variant="outline" className="flex items-center gap-1 border-[#A8E6CF] text-[#2d2d2d]">
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
          <Badge variant="outline" className="flex items-center gap-1 border-[#A8E6CF] text-[#2d2d2d]">
            {filterThankYou ? "Thanked" : "Not Thanked"}
            <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterThankYou(null)} />
          </Badge>
        )}
        {(filterType || filterThankYou !== null) && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear All
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Filter
              <ChevronDown className="ml-2 h-4 w-4 text-[#2d2d2d]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onSelect={() => setFilterType("non registry")}>
              <Package className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Non Registry Gifts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilterType("monetary")}>
              <DollarSign className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Monetary Gifts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilterType("registry")}>
              <Gift className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Registry Gifts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilterType("multiple")}>
              <Gift className="mr-2 h-4 w-4 text-[#2d2d2d]" />
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4 text-[#2d2d2d]" />
              Sort
              <ChevronDown className="ml-2 h-4 w-4 text-[#2d2d2d]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onSelect={() => setSortMethod("name-asc")}>Name (A-Z)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSortMethod("name-desc")}>Name (Z-A)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSortMethod("newest")}>Newest First</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSortMethod("oldest")}>Oldest First</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import button */}
        <input
          type="file"
          accept=".csv"
          hidden
          ref={fileInputRef}
          onChange={handleFile}
        />
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4 text-[#A4D9C9]" />
          Import
        </Button>

        {/* Export button */}
        <Button variant="ghost" size="sm" onClick={exportAsCSV}>
          <Download className="mr-2 h-4 w-4 text-[#A4D9C9]" />
          Export
        </Button>

        {/* Add Gift button */}
        <Button size="sm" className="bg-[#A8E6CF] hover:bg-[#98CFBA] text-[#2d2d2d]" onClick={openAddGift}>
          <Plus className="mr-1 h-4 w-4 text-[#2d2d2d]" />
          Add Gift
        </Button>
      </div>
    </div>
  );
}
