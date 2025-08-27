"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuotaBanner, useBillingSummary } from "@/components/QuotaBanner";
import { GiftList } from "./components/GiftList";
import { GiftListControls } from "./components/GiftListControls";
import { ReminderSettingsDialog } from "@/components/ReminderSettingsDialog";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { ThankYouComposerDialog } from "./components/ThankYouComposerDialog";
import { EditGiftDialog } from "./components/EditGiftDialog";
import { AddGiftDialog } from "./components/AddGiftDialog";
import { DeleteGiftDialog } from "./components/DeleteGiftDialog";
import type { Note } from "@/components/thankyous/types";

export type UIGift = {
  id: string;
  guestName: string;
  description: string;
  type: "non registry" | "monetary" | "registry" | "multiple";
  date: string; // YYYY-MM-DD
  thankYouSent: boolean;
};

type List = { id: string; name: string };

export default function GiftHubClient({
  listId,
  gifts,
  lists,
  notes,
}: {
  listId: string;
  gifts: UIGift[];
  lists: List[];
  notes: Note[];
}) {
  const { data: billing } = useBillingSummary();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState<UIGift["type"] | null>(null);
  const [filterThankYou, setFilterThankYou] = React.useState<boolean | null>(null);
  const [filterHasNote, setFilterHasNote] = React.useState<boolean | null>(null);
  const [sortMethod, setSortMethod] = React.useState<string>("");

  const [isListReminderOpen, setIsListReminderOpen] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [reminderGift, setReminderGift] = React.useState<UIGift | null>(null);

  const [composerGift, setComposerGift] = React.useState<UIGift | null>(null);
  const [isComposerOpen, setIsComposerOpen] = React.useState(false);

  const [editGift, setEditGift] = React.useState<UIGift | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const [isAddGiftOpen, setIsAddGiftOpen] = React.useState(false);

  const [deleteGift, setDeleteGift] = React.useState<UIGift | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Build note status map per gift (none | draft | sent)
  const noteStatusMap = React.useMemo(() => {
    const m = new Map<string, "none" | "draft" | "sent">();
    for (const g of gifts) m.set(g.id, "none");
    for (const n of notes) {
      const prev = m.get(n.gift_id) ?? "none";
      if (n.status === "sent") m.set(n.gift_id, "sent");
      else if (prev !== "sent") m.set(n.gift_id, "draft");
    }
    return m;
  }, [gifts, notes]);

  const filtered = gifts.filter((gift) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      gift.guestName.toLowerCase().includes(q) || gift.description.toLowerCase().includes(q);
    const matchesType = filterType ? gift.type === filterType : true;
    const matchesThank = filterThankYou !== null ? gift.thankYouSent === filterThankYou : true;
    const status = noteStatusMap.get(gift.id) ?? "none";
    const hasNote = status !== "none";
    const matchesHasNote = filterHasNote !== null ? hasNote === filterHasNote : true;
    return matchesSearch && matchesType && matchesThank && matchesHasNote;
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
    setFilterHasNote(null);
    setSortMethod("");
  };

  const openGiftReminder = (gift: UIGift) => {
    setReminderGift(gift);
    setIsAddOpen(true);
  };

  const openComposer = (gift: UIGift) => {
    setComposerGift(gift);
    setIsComposerOpen(true);
  };

  const openEditGift = (gift: UIGift) => {
    setEditGift(gift);
    setIsEditOpen(true);
  };

  const openAddGift = () => {
    setIsAddGiftOpen(true);
  };

  const openDeleteGift = (gift: UIGift) => {
    setDeleteGift(gift);
    setIsDeleteDialogOpen(true);
  };

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
            <h1 className="text-3xl font-bold text-[#2d2d2d]">Gift Hub</h1>
            <div className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button size="sm" variant="ghost" className="text-[#2d2d2d]">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Controls + right column */}
          <div className="grid items-start gap-4 md:grid-cols-[1fr_360px]">
            <GiftListControls
              lists={lists}
              currentListId={listId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              filterThankYou={filterThankYou}
              setFilterThankYou={setFilterThankYou}
              filterHasNote={filterHasNote}
              setFilterHasNote={setFilterHasNote}
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
          gifts={sorted}
          noteStatusMap={noteStatusMap}
          onEditGift={openEditGift}
          onAddGift={() => { /* handled elsewhere */ }}
          onRemindGift={openGiftReminder}
          onComposeThankYou={openComposer}
          onDeleteGift={openDeleteGift}
        />
      </div>

      {/* Reminders */}
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

      {/* Unified inline composer */}
      {composerGift ? (
        <ThankYouComposerDialog
          isOpen={isComposerOpen}
          onOpenChange={setIsComposerOpen}
          listId={listId}
          gift={composerGift}
          notes={notes.filter((n) => n.gift_id === composerGift.id)}
        />
      ) : null}

      {/* Edit Gift Dialog */}
      {editGift ? (
        <EditGiftDialog
          listId={listId}
          gift={editGift}
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
        />
      ) : null}

      {/* Add Gift Dialog */}
      <AddGiftDialog
        listId={listId}
        isOpen={isAddGiftOpen}
        setIsOpen={setIsAddGiftOpen}
      />

      {/* Delete Gift Dialog */}
      {deleteGift ? (
        <DeleteGiftDialog
          listId={listId}
          gift={{ id: deleteGift.id, guestName: deleteGift.guestName }}
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
        />
      ) : null}
    </>
  );
}