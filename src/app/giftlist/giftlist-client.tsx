// src/app/giftlist/giftlist-client.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddGiftDialog } from "./components/AddGiftDialog";
import { EditGiftDialog } from "./components/EditGiftDialog";
import { GiftList } from "./components/GiftList";
import { ReminderSettingsDialog } from "@/components/ReminderSettingsDialog";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { GiftListControls } from "./components/GiftListControls";
import { QuotaBanner, useBillingSummary } from "@/components/QuotaBanner";

export type UIGift = {
  id: string;
  guestName: string;
  description: string;
  type: "non registry" | "monetary" | "registry" | "multiple";
  date: string; // YYYY-MM-DD
  thankYouSent: boolean;
};

type List = { id: string; name: string };

export default function GiftListClient({
  listId,
  gifts,
  lists,
}: {
  listId: string;
  gifts: UIGift[];
  lists: List[];
}) {
  const { data: billing } = useBillingSummary();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState<string | null>(null);
  const [filterThankYou, setFilterThankYou] = React.useState<boolean | null>(null);
  const [sortMethod, setSortMethod] = React.useState<string>("");
  const [editingGift, setEditingGift] = React.useState<UIGift | null>(null);
  const [isAddGiftOpen, setIsAddGiftOpen] = React.useState(false);
  const [isEditGiftOpen, setIsEditGiftOpen] = React.useState(false);

  const [isListReminderOpen, setIsListReminderOpen] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [reminderGift, setReminderGift] = React.useState<UIGift | null>(null);

  // Removed in favor of dedicated Thank You pages

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

  const openGiftReminder = (gift: UIGift) => {
    setReminderGift(gift);
    setIsAddOpen(true);
  };

  // no-op: drafting handled under /thankyou

  const stats = React.useMemo(() => {
    const total = gifts.length;
    const thanked = gifts.filter((g) => g.thankYouSent).length;
    return { total, thanked, pending: total - thanked };
  }, [gifts]);

  return (
    <>
      <div className="space-y-6">
        {billing ? <QuotaBanner context="lists" /> : null}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {/* Header row with View Dashboard */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[#2d2d2d]">Gift List</h1>
            <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="text-[#2d2d2d]">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Controls + right column */}
          <div className="grid items-start gap-4 md:grid-cols-[1fr_360px]">
            {/* Left: list selector + search + filter/sort */}
            <GiftListControls
              lists={lists}
              currentListId={listId}
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
              openAddReminder={() => setIsAddOpen(true)}
            />

            {/* Right: stats */}
            <div className="flex flex-col gap-3 md:justify-start">
              <QuotaBanner context="gifts" listGiftCount={gifts.length} />
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-3">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    Total
                  </div>
                  <div className="text-lg font-semibold text-[#2d2d2d]">{stats.total}</div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-3">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    Thanked
                  </div>
                  <div className="text-lg font-semibold text-[#2d2d2d]">{stats.thanked}</div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-3">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    Pending
                  </div>
                  <div className="text-lg font-semibold text-[#2d2d2d]">{stats.pending}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GiftList
          listId={listId}
          gifts={sorted}
          onEditGift={handleEditGift}
          onAddGift={openAddGift}
          onRemindGift={openGiftReminder}
        />
      </div>

      <AddGiftDialog listId={listId} isOpen={isAddGiftOpen} setIsOpen={setIsAddGiftOpen} />

      {editingGift && (
        <EditGiftDialog
          listId={listId}
          gift={editingGift}
          isOpen={isEditGiftOpen}
          setIsOpen={setIsEditGiftOpen}
        />
      )}

      <ReminderSettingsDialog
        isOpen={isListReminderOpen}
        setIsOpen={setIsListReminderOpen}
        listId={listId}
      />

      <AddReminderDialog
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        listId={listId}
        initialGiftId={reminderGift ? reminderGift.id : undefined}
      />

      {/* Draft composer removed from Gift List. Use /thankyou instead. */}
    </>
  );
}