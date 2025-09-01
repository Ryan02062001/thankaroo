"use client";

import * as React from "react";
import Link from "next/link";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
// import { QuotaBanner, useBillingSummary } from "@/components/QuotaBanner";
import { GiftList } from "@/components/giftlist/GiftList";
import { GiftListControls } from "@/components/giftlist/GiftListControls";
import { ReminderSettingsDialog } from "@/components/ReminderSettingsDialog";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { ThankYouComposerDialog } from "@/components/giftlist/ThankYouComposerDialog";
import { EditGiftDialog } from "@/components/giftlist/EditGiftDialog";
import { AddGiftDialog } from "@/components/giftlist/AddGiftDialog";
import { DeleteGiftDialog } from "@/components/giftlist/DeleteGiftDialog";

import { CompletionCard } from "@/components/giftlist/CompletionCard";
import { KpiCard } from "@/components/giftlist/KpiCard";
import type { UIGift, ImportGiftItem } from "@/components/giftlist/types";
import type { Note } from "@/components/thankyous/types";
import { toggleThankYouDirect } from "@/app/actions/gifts";

export type { UIGift, ImportGiftItem };

type List = { id: string; name: string };

export default function GiftHubClient({
  listId,
  gifts,
  lists,
  notes,
  onImportGifts,
}: {
  listId: string;
  gifts: UIGift[];
  lists: List[];
  notes: Note[];
  onImportGifts: (items: ImportGiftItem[]) => Promise<UIGift[]>;
}) {
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

  const [giftsState, setGiftsState] = React.useState<UIGift[]>(gifts);
  const [notesState, setNotesState] = React.useState<Note[]>(notes);

  // Reset local state when listId changes to prevent stale data bleed
  React.useEffect(() => {
    setGiftsState(gifts);
    setNotesState(notes);
    setSearchTerm("");
    setFilterType(null);
    setFilterThankYou(null);
    setFilterHasNote(null);
    setSortMethod("");
    setIsAddOpen(false);
    setReminderGift(null);
    setComposerGift(null);
    setIsComposerOpen(false);
    setEditGift(null);
    setIsEditOpen(false);
    setIsAddGiftOpen(false);
    setDeleteGift(null);
    setIsDeleteDialogOpen(false);
  }, [listId, gifts, notes]);

  const noteStatusMap = React.useMemo(() => {
    const m = new Map<string, "none" | "draft" | "sent">();
    for (const g of giftsState) m.set(g.id, "none");
    for (const n of notesState) {
      const prev = m.get(n.gift_id) ?? "none";
      if (n.status === "sent") m.set(n.gift_id, "sent");
      else if (prev !== "sent") m.set(n.gift_id, "draft");
    }
    return m;
  }, [giftsState, notesState]);

  const filtered = giftsState.filter((gift) => {
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

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortMethod === "name-asc") return a.guestName.localeCompare(b.guestName);
      if (sortMethod === "name-desc") return b.guestName.localeCompare(a.guestName);
      if (sortMethod === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortMethod === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return 0;
    });
  }, [filtered, sortMethod]);

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

  const openAddGift = () => setIsAddGiftOpen(true);

  const openDeleteGift = (gift: UIGift) => {
    setDeleteGift(gift);
    setIsDeleteDialogOpen(true);
  };

  const stats = React.useMemo(() => {
    const total = giftsState.length;
    const thanked = giftsState.filter((g) => g.thankYouSent).length;
    const pending = Math.max(0, total - thanked);
    const progress = total > 0 ? Math.round((thanked / total) * 100) : 0;
    return { total, thanked, pending, progress };
  }, [giftsState]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [busy, startTransition] = React.useTransition();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parseYes = (v: unknown) => /^(y|yes|true|1)$/i.test(String(v ?? "").trim());
        const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

        const items: ImportGiftItem[] = results.data.map((row) => {
          const G = (row["Guest Name"] ?? "").trim();
          const D = (row["Gift Description"] ?? "").trim();
          const rawType = (row["Type"] ?? "").trim().toLowerCase();
          const T = (rawType as UIGift["type"]) || "non registry";
          const Dt = (row["Date Received"] ?? "").trim();
          const Y = parseYes(row["Thank You Sent"]);

          const type: UIGift["type"] = ["non registry", "monetary", "registry", "multiple"].includes(T)
            ? T
            : "non registry";

          const date = isISODate(Dt) ? Dt : new Date().toISOString().split("T")[0];

          return { guestName: G, description: D, type, date, thankYouSent: Y };
        });

        startTransition(async () => {
          const inserted = await onImportGifts(items);
          if (inserted && inserted.length > 0) {
            setGiftsState((prev) => [...inserted, ...prev]);
          }
        });
      },
    });

    e.target.value = "";
  };

  const exportAsCSV = () => {
    const rows = giftsState.map((g) => ({
      "Guest Name": g.guestName,
      "Gift Description": g.description,
      Type: g.type,
      "Date Received": g.date,
      "Thank You Sent": g.thankYouSent ? "Yes" : "No",
    }));
    const csv = Papa.unparse(rows, { header: true });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement("a");
    a.href = url;
    a.download = "gift-list.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Quota warnings are shown only contextually on specific actions, not persistently */}

        <section aria-labelledby="dashboard-overview">
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 id="dashboard-overview" className="text-4xl md:text-5xl font-extrabold text-[#2d2d2d]">
                  Gift Hub
                </h1>
                <p className="mt-1 text-base md:text-lg text-[#2d2d2d]/70">
                  Track gifts and thank-yous in one elegant view.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/reminders?list=${encodeURIComponent(listId)}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-12 w-[176px] rounded-xl border-[#A8E6CF] text-[#2f9c79] hover:bg-[#A8E6CF]/30"
                  >
                    Open Reminders
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mb-6">
              <CompletionCard thanked={stats.thanked} total={stats.total} progress={stats.progress} />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <KpiCard label="TOTAL" value={stats.total} badge="All time" />
              <KpiCard label="THANKED" value={stats.thanked} badge="Completed" badgeTone="success" />
              <KpiCard label="PENDING" value={stats.pending} badge="Action" badgeTone="warn" />
            </div>
          </div>
        </section>

        <section aria-labelledby="manage-gifts">
          <h2 id="manage-gifts" className="sr-only">Manage gifts</h2>
          <div className="rounded-3xl border border-gray-200 bg-[#fefefe] p-4 sm:p-6 md:p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              hidden
              onChange={handleFile}
            />

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
              onTriggerImport={() => fileInputRef.current?.click()}
              onExportCSV={exportAsCSV}
              importBusy={busy}
            />
          </div>

          <div className="mt-4">
            <GiftList
              gifts={sorted}
              noteStatusMap={noteStatusMap}
              onEditGift={openEditGift}
              onAddGift={() => {}
              }
              onRemindGift={openGiftReminder}
              onComposeThankYou={openComposer}
              onDeleteGift={openDeleteGift}
              onToggleThankYou={async (g) => {
                try {
                  const { thankYouSent } = await toggleThankYouDirect({ id: g.id });
                  setGiftsState((prev) => prev.map((x) => (x.id === g.id ? { ...x, thankYouSent } : x)));
                } catch {}
              }}
            />
          </div>
        </section>
      </div>

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

      {composerGift ? (
        <ThankYouComposerDialog
          isOpen={isComposerOpen}
          onOpenChange={setIsComposerOpen}
          listId={listId}
          gift={composerGift}
          notes={notesState.filter((n) => n.gift_id === composerGift.id)}
          onSaved={(note) => {
            setNotesState((prev) => {
              const idx = prev.findIndex((n) => n.id === note.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = note;
                return next;
              }
              return [note, ...prev];
            });
          }}
          onSent={(note) => {
            setNotesState((prev) => {
              const idx = prev.findIndex((n) => n.id === note.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = note;
                return next;
              }
              return [note, ...prev];
            });
            setGiftsState((prev) => prev.map((g) => (g.id === note.gift_id ? { ...g, thankYouSent: true } : g)));
          }}
        />
      ) : null}

      {editGift ? (
        <EditGiftDialog
          listId={listId}
          gift={editGift}
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          onUpdated={(g) => setGiftsState((prev) => prev.map((x) => (x.id === g.id ? g : x)))}
        />
      ) : null}

      <AddGiftDialog
        listId={listId}
        isOpen={isAddGiftOpen}
        setIsOpen={setIsAddGiftOpen}
        onCreated={(gift) => setGiftsState((prev) => [gift, ...prev])}
      />

      {deleteGift ? (
        <DeleteGiftDialog
          listId={listId}
          gift={{ id: deleteGift.id, guestName: deleteGift.guestName }}
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          onDeleted={(id) => setGiftsState((prev) => prev.filter((g) => g.id !== id))}
        />
      ) : null}
    </>
  );
}
