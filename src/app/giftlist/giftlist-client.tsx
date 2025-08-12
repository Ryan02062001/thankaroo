"use client";

import * as React from "react";
import { AddGiftDialog } from "./components/AddGiftDialog";
import { EditGiftDialog } from "./components/EditGiftDialog";
import { GiftListControls } from "./components/GiftListControls";
import { GiftList } from "./components/GiftList";

export type UIGift = {
  id: string;
  guestName: string;
  description: string;
  type: "non registry" | "monetary" | "registry" | "multiple";
  date: string; // YYYY-MM-DD
  thankYouSent: boolean;
};

export default function GiftListClient({
  listId,
  gifts,
}: {
  listId: string;
  gifts: UIGift[];
}) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState<string | null>(null);
  const [filterThankYou, setFilterThankYou] = React.useState<boolean | null>(null);
  const [sortMethod, setSortMethod] = React.useState<string>("");
  const [editingGift, setEditingGift] = React.useState<UIGift | null>(null);
  const [isAddGiftOpen, setIsAddGiftOpen] = React.useState(false);
  const [isEditGiftOpen, setIsEditGiftOpen] = React.useState(false);

  const filtered = gifts.filter((gift) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      gift.guestName.toLowerCase().includes(q) || gift.description.toLowerCase().includes(q);
    const matchesType = filterType ? gift.type === filterType : true;
    const matchesThank = filterThankYou !== null ? gift.thankYouSent === filterThankYou : true;
    return matchesSearch && matchesType && matchesThank;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortMethod === "name-asc") return a.guestName.localeCompare(b.guestName);
    if (sortMethod === "name-desc") return b.guestName.localeCompare(a.guestName);
    if (sortMethod === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortMethod === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
    return 0;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setFilterType(null);
    setFilterThankYou(null);
    setSortMethod("");
  };

  const openAddGift = () => setIsAddGiftOpen(true);
  const handleEditGift = (gift: UIGift) => {
    setEditingGift(gift);
    setIsEditGiftOpen(true);
  };

  return (
    <>
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
        openAddGift={openAddGift}
      />

      <GiftList listId={listId} gifts={sorted} onEditGift={handleEditGift} onAddGift={openAddGift} />

      <AddGiftDialog listId={listId} isOpen={isAddGiftOpen} setIsOpen={setIsAddGiftOpen} />

      {editingGift && (
        <EditGiftDialog
          listId={listId}
          gift={editingGift}
          isOpen={isEditGiftOpen}
          setIsOpen={setIsEditGiftOpen}
        />
      )}
    </>
  );
}
