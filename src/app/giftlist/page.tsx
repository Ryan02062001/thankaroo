"use client";

import { useState } from "react";
import { GiftListControls } from "./components/GiftListControls";
import { AddGiftDialog } from "./components/AddGiftDialog";
import { GiftList } from "./components/GiftList";
import { EditGiftDialog } from "./components/EditGiftDialog";
import { useGifts, GiftItem } from "../contexts/GiftContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListSelector } from "@/components/ui/list-selector";

export default function GiftListPage() {
  const {
    gifts,
    addGift,
    deleteGift,
    toggleThankYou,
    exportAsCSV,
    updateGift,
  } = useGifts();

  // UI state for search, filtering, and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterThankYou, setFilterThankYou] = useState<boolean | null>(null);
  const [sortMethod, setSortMethod] = useState<string>("");

  // UI state for the add gift dialog
  const [newGift, setNewGift] = useState<Omit<GiftItem, "id">>({
    guestName: "",
    description: "",
    type: "non registry",
    date: new Date().toISOString().split("T")[0],
    thankYouSent: false,
  });
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false);

  // State for editing a gift
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  const [isEditGiftOpen, setIsEditGiftOpen] = useState(false);

  // Apply search and filter to the gifts from context
  const filteredGifts = gifts.filter((gift) => {
    const matchesSearch =
      gift.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gift.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? gift.type === filterType : true;
    const matchesThankYou =
      filterThankYou !== null ? gift.thankYouSent === filterThankYou : true;
    return matchesSearch && matchesType && matchesThankYou;
  });

  // Apply sorting (without permanently altering the context state)
  const sortedGifts = [...filteredGifts].sort((a, b) => {
    if (sortMethod === "name-asc") {
      return a.guestName.localeCompare(b.guestName);
    } else if (sortMethod === "name-desc") {
      return b.guestName.localeCompare(a.guestName);
    } else if (sortMethod === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortMethod === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

  const handleAddGift = () => {
    addGift(newGift);
    setNewGift({
      guestName: "",
      description: "",
      type: "non registry",
      date: new Date().toISOString().split("T")[0],
      thankYouSent: false,
    });
    setIsAddGiftOpen(false);
  };

  // Called when the edit button is clicked on a gift card
  const handleEditGift = (gift: GiftItem) => {
    setEditingGift(gift);
    setIsEditGiftOpen(true);
  };

  // Update the gift using the context updateGift method
  const handleUpdateGift = () => {
    if (editingGift) {
      updateGift(editingGift.id, {
        guestName: editingGift.guestName,
        description: editingGift.description,
        type: editingGift.type,
        date: editingGift.date,
        thankYouSent: editingGift.thankYouSent,
      });
      setIsEditGiftOpen(false);
      setEditingGift(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterType(null);
    setFilterThankYou(null);
  };

  const openAddGift = () => {
    setIsAddGiftOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fefefe] pt-20">
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center space-x-7 mb-5">
          <h1 className="text-4xl font-bold text-[#2d2d2d]">Gift List</h1>
          <Link href="/dashboard">
            <Button size="sm" variant="ghost" className=" text-[#2d2d2d]">
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* ← LIST SWITCHER HERE */}
        <ListSelector />
        <GiftListControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterThankYou={filterThankYou}
          setFilterThankYou={setFilterThankYou}
          sortMethod={sortMethod}
          setSortMethod={setSortMethod}
          resetFilters={resetFilters}
          exportAsCSV={exportAsCSV}
          openAddGift={openAddGift}
          giftsLength={gifts.length}
        />
        <GiftList
          gifts={sortedGifts}
          onDeleteGift={deleteGift}
          onToggleThankYou={toggleThankYou}
          onEditGift={handleEditGift}
          onAddGift={openAddGift}
        />
        <AddGiftDialog
          newGift={newGift}
          setNewGift={setNewGift}
          isOpen={isAddGiftOpen}
          setIsOpen={setIsAddGiftOpen}
          handleAddGift={handleAddGift}
        />
        {editingGift && (
          <EditGiftDialog
            gift={editingGift}
            setGift={setEditingGift as (gift: GiftItem) => void}
            isOpen={isEditGiftOpen}
            setIsOpen={setIsEditGiftOpen}
            handleUpdateGift={handleUpdateGift}
          />
        )}
      </main>
    </div>
  );
}
