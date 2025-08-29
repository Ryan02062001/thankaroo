"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

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

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type UIGift = {
  id: string;
  guestName: string;
  description: string;
  type: "non registry" | "monetary" | "registry" | "multiple";
  date: string; // YYYY-MM-DD
  thankYouSent: boolean;
};

type List = { id: string; name: string };

export type ImportGiftItem = {
  guestName: string;
  description: string;
  type: UIGift["type"];
  date: string; // YYYY-MM-DD
  thankYouSent: boolean;
};

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
  onImportGifts: (items: ImportGiftItem[]) => Promise<void>;
}) {
  const router = useRouter();
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

  // -------- Derived stats --------
  const stats = React.useMemo(() => {
    const total = gifts.length;
    const thanked = gifts.filter((g) => g.thankYouSent).length;
    const pending = Math.max(0, total - thanked);
    const progress = total > 0 ? Math.round((thanked / total) * 100) : 0;
    return { total, thanked, pending, progress };
  }, [gifts]);

  // -------- Import/Export (callbacks passed to controls) --------
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
          await onImportGifts(items);
          router.refresh();
        });
      },
    });

    // allow same-file re-upload
    e.target.value = "";
  };

  const exportAsCSV = () => {
    const rows = gifts.map((g) => ({
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
        {billing ? <QuotaBanner context="lists" /> : null}

        {/* Dashboard – unchanged */}
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
   <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xl font-bold text-[#2d2d2d]">Thank‑You Completion</span>
                <span className="inline-flex items-center rounded-full border border-[#A8E6CF] bg-[#A8E6CF]/20 px-2.5 py-1 text-xs font-medium text-[#2f9c79]">
                  {stats.thanked} of {stats.total}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={stats.progress}
                  className="h-4 bg-[#A8E6CF]/40 [&>div]:bg-[linear-gradient(to_right,#2f9c79,#3EB489)] [&>div]:shadow-sm"
                  aria-label="Overall thank you progress"
                />
                <div className="mt-2 text-xs text-[#2d2d2d]/70">{stats.progress}% completed</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <KpiCard label="TOTAL" value={stats.total} badge="All time" />
              <KpiCard label="THANKED" value={stats.thanked} badge="Completed" badgeTone="success" />
              <KpiCard label="PENDING" value={stats.pending} badge="Action" badgeTone="warn" />
            </div>

         
          </div>
        </section>

        {/* ===== Manage – controls (Import/Export are inside GiftListControls) ===== */}
        <section aria-labelledby="manage-gifts">
          <div className="rounded-3xl border border-gray-200 bg-[#fefefe] p-6 md:p-8">
            {/* Hidden file input for Import */}
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

          {/* Gift table */}
          <div className="mt-4">
            <GiftList
              gifts={sorted}
              noteStatusMap={noteStatusMap}
              onEditGift={openEditGift}
              onAddGift={() => {
                /* handled via controls */
              }}
              onRemindGift={openGiftReminder}
              onComposeThankYou={openComposer}
              onDeleteGift={openDeleteGift}
            />
          </div>
        </section>
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

// -----------------------
function KpiCard({
  label,
  value,
  badge,
  badgeTone,
}: {
  label: string;
  value: number | string;
  badge?: string;
  badgeTone?: "success" | "warn" | "neutral";
}) {
  const badgeClass =
    badgeTone === "success"
      ? "border-[#3EB489]/40 bg-[#3EB489]/10 text-[#2f9c79]"
      : badgeTone === "warn"
      ? "border-amber-300/60 bg-amber-100/40 text-amber-800"
      : "border-gray-200 bg-gray-50 text-gray-600";

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6 md:p-7">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 text-4xl md:text-5xl font-semibold leading-none text-[#2d2d2d]">
              {value}
            </div>
          </div>
          {badge ? (
            <div className={`rounded-full border px-3 py-1 text-xs ${badgeClass}`}>{badge}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
