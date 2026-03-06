// path: /app/giftlist/gift-hub-client.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import { GiftList } from "@/components/giftlist/GiftList";
import { GiftListControls } from "@/components/giftlist/GiftListControls";
import { ReminderSettingsDialog } from "@/components/ReminderSettingsDialog";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { ThankYouComposerDialog } from "@/components/giftlist/ThankYouComposerDialog";
import { EditGiftDialog } from "@/components/giftlist/EditGiftDialog";
import { AddGiftDialog } from "@/components/giftlist/AddGiftDialog";
import { DeleteGiftDialog } from "@/components/giftlist/DeleteGiftDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { CompletionCard } from "@/components/giftlist/CompletionCard";
import { KpiCard } from "@/components/giftlist/KpiCard";
import type { UIGift, ImportGiftItem } from "@/components/giftlist/types";
import type { Note } from "@/components/thankyous/types";
import { toggleThankYouDirect } from "@/app/actions/gifts";
import { useRouter } from "next/navigation";
import { todayYmd } from "@/lib/date";
import { buildGiftSignature, dedupeImportGiftItems } from "@/lib/gifts";

export type { UIGift, ImportGiftItem };

type List = { id: string; name: string };

function mergeUniqueGifts(existing: UIGift[], incoming: UIGift[]) {
  const seenIds = new Set(existing.map((gift) => gift.id));
  const seenSignatures = new Set(existing.map((gift) => buildGiftSignature(gift)));
  const additions: UIGift[] = [];

  for (const gift of incoming) {
    if (seenIds.has(gift.id)) {
      continue;
    }

    const signature = buildGiftSignature(gift);
    if (seenSignatures.has(signature)) {
      continue;
    }

    seenIds.add(gift.id);
    seenSignatures.add(signature);
    additions.push(gift);
  }

  return additions.length > 0 ? [...additions, ...existing] : existing;
}

export default function GiftHubClient({
  listId,
  gifts,
  lists,
  notes,
  onImportGifts,
  guestMode = false,
}: {
  listId: string;
  gifts: UIGift[];
  lists: List[];
  notes: Note[];
  onImportGifts: (items: ImportGiftItem[]) => Promise<UIGift[]>;
  guestMode?: boolean;
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
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);

  // --- guest-mode counters & prompt state ---
  const guestCreatedCountRef = React.useRef(0);
  const [savePromptShown, setSavePromptShown] = React.useState(false);
  const [isSavePromptOpen, setIsSavePromptOpen] = React.useState(false);
  const [showUnsavedBanner, setShowUnsavedBanner] = React.useState(false);

  // --- router for signup navigation ---
  const router = useRouter();

  // ---- Guest helpers (no persistence) ----
  const genId = React.useCallback(() => {
    try {
      if (typeof crypto !== "undefined" && typeof (crypto as Crypto).randomUUID === "function") {
        return (crypto as Crypto).randomUUID();
      }
    } catch {}
    return Math.random().toString(36).slice(2);
  }, []);

  const createGuestGift = React.useCallback(async (input: {
    listId: string;
    guestName: string;
    description: string;
    giftType: UIGift["type"];
    dateReceived?: string | null;
  }): Promise<UIGift> => {
    return {
      id: genId(),
      guestName: input.guestName,
      description: input.description,
      type: input.giftType,
      date: input.dateReceived || todayYmd(),
      thankYouSent: false,
    };
  }, [genId]);

  const updateGuestGift = React.useCallback(async (input: {
    id: string;
    guestName: string;
    description: string;
    giftType: UIGift["type"];
    dateReceived?: string | null;
    thankYouSent?: boolean;
  }): Promise<UIGift> => {
    return {
      id: input.id,
      guestName: input.guestName,
      description: input.description,
      type: input.giftType,
      date: input.dateReceived || todayYmd(),
      thankYouSent: !!input.thankYouSent,
    };
  }, []);

  const deleteGuestGift = React.useCallback(async (id: string) => {
    void id;
  }, []);

  const [giftsState, setGiftsState] = React.useState<UIGift[]>(gifts);
  const [notesState, setNotesState] = React.useState<Note[]>(notes);

  // Reset local state when list changes
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
    setPageError(null);
  }, [listId, gifts, notes]);

  const stashGuestGiftsToSession = React.useCallback(() => {
    try {
      const items: ImportGiftItem[] = giftsState.map((g) => ({
        guestName: g.guestName,
        description: g.description,
        type: g.type,
        date: g.date,
        thankYouSent: g.thankYouSent,
      }));
      sessionStorage.setItem("thankaroo_unsaved", JSON.stringify(items));
    } catch {}
  }, [giftsState]);

  const onSaveMyList = React.useCallback(() => {
    stashGuestGiftsToSession();
    setIsSavePromptOpen(false);
    router.push("/signup?next=/giftlist");
  }, [stashGuestGiftsToSession, router]);

  const onContinueWithoutSaving = React.useCallback(() => {
    setIsSavePromptOpen(false);
    setShowUnsavedBanner(true);
  }, []);

  // Import stashed gifts after login (non-guest)
  const importOnceRef = React.useRef(false);

  React.useEffect(() => {
    if (guestMode) return;
    if (importOnceRef.current) return;
    let cancelled = false;

    void (async () => {
      try {
        const raw =
          typeof window !== "undefined"
            ? window.sessionStorage.getItem("thankaroo_unsaved")
            : null;
        if (!raw) return;

        const parsed = JSON.parse(raw) as unknown;
        const items = Array.isArray(parsed) ? (parsed as ImportGiftItem[]) : [];
        const unique = dedupeImportGiftItems(items);
        importOnceRef.current = true;

        if (!unique.length) {
          window.sessionStorage.removeItem("thankaroo_unsaved");
          return;
        }

        setIsImporting(true);
        const inserted = await onImportGifts(unique);
        if (!cancelled) {
          window.sessionStorage.removeItem("thankaroo_unsaved");
        }
        if (!cancelled && inserted?.length) {
          setPageError(null);
          setGiftsState((prev) => mergeUniqueGifts(prev, inserted));
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(
            error instanceof Error ? error.message : "Unable to import your saved gifts right now."
          );
        }
      } finally {
        if (!cancelled) {
          setIsImporting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [guestMode, onImportGifts]);

  // Intercept clicks to /signup anywhere on the page while in guest mode
  React.useEffect(() => {
    if (!guestMode) return;
    const onDocClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a[href^="/signup"]') as HTMLAnchorElement | null;
      const trigger = target.closest('[data-save-and-signup]') as HTMLElement | null;
      if (!anchor && !trigger) return;
      e.preventDefault();

      stashGuestGiftsToSession();
      const href = anchor?.getAttribute("href") ?? "/signup";
      const nexted =
        href.includes("next=") ? href : (href.includes("?") ? `${href}&next=/giftlist` : `${href}?next=/giftlist`);
      router.push(nexted);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [guestMode, stashGuestGiftsToSession, router]);

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
      if (sortMethod === "newest") return b.date.localeCompare(a.date);
      if (sortMethod === "oldest") return a.date.localeCompare(b.date);
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
  const promptGuestSignup = React.useCallback((message: string) => {
    setPageError(message);
    setSavePromptShown(true);
    setIsSavePromptOpen(true);
  }, []);

  const handleGuestGiftCreated = React.useCallback((g: UIGift) => {
    setPageError(null);
    setGiftsState((prev) => [g, ...prev]);
    const next = guestCreatedCountRef.current + 1;
    guestCreatedCountRef.current = next;
    if (next >= 2 && !savePromptShown) {
      setIsSavePromptOpen(true);
      setSavePromptShown(true);
    }
  }, [savePromptShown]);

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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      error: () => {
        setPageError("We couldn't read that CSV file. Please check the format and try again.");
      },
      complete: (results) => {
        const parseYes = (v: unknown) => /^(y|yes|true|1)$/i.test(String(v ?? "").trim());
        const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

        const items = dedupeImportGiftItems(results.data.map((row) => {
          const G = (row["Guest Name"] ?? "").trim();
          const D = (row["Gift Description"] ?? "").trim();
          const Dt = (row["Date Received"] ?? "").trim();
          const Y = parseYes(row["Thank You Sent"]);

          return {
            guestName: G,
            description: D,
            type: (row["Type"] ?? "").trim().toLowerCase() as UIGift["type"],
            date: isISODate(Dt) ? Dt : todayYmd(),
            thankYouSent: Y,
          };
        }));

        if (!items.length) {
          setPageError("No valid gift rows were found in that CSV.");
          return;
        }

        setPageError(null);
        setIsImporting(true);

        void (async () => {
          try {
            const inserted = await onImportGifts(items);
            if (inserted?.length) {
              setGiftsState((prev) => mergeUniqueGifts(prev, inserted));
            }
          } catch (error) {
            setPageError(
              error instanceof Error ? error.message : "Import failed. Please try again."
            );
          } finally {
            setIsImporting(false);
          }
        })();
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
        {pageError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {pageError}
          </div>
        ) : null}

        {/* Persistent banner after skipping signup */}
        {guestMode && showUnsavedBanner && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
            ⚠️ Your list isn’t saved. Create a free account anytime to keep it. Data won’t be stored after this session ends.
          </div>
        )}

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
                {guestMode ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-12 w-full rounded-xl border-[#A8E6CF] text-[#2f9c79] hover:bg-[#A8E6CF]/30"
                    onClick={onSaveMyList}
                    data-save-and-signup
                  >
                    Create Account (Save My List)
                  </Button>
                ) : (
                  <Link href={`/reminders?list=${encodeURIComponent(listId)}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-12 w-full rounded-xl border-[#A8E6CF] text-[#2f9c79] hover:bg-[#A8E6CF]/30"
                    >
                      Open Reminders
                    </Button>
                  </Link>
                )}
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
              listsDisabled={guestMode}
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
              onTriggerImport={() => fileInputRef.current?.click()}
              onExportCSV={exportAsCSV}
              importBusy={isImporting}
            />
          </div>

          <div className="mt-4">
            <GiftList
              gifts={sorted}
              noteStatusMap={noteStatusMap}
              onEditGift={openEditGift}
              onAddGift={openAddGift}
              onRemindGift={
                guestMode
                  ? () => promptGuestSignup("Create an account to set reminders for your gifts.")
                  : openGiftReminder
              }
              onComposeThankYou={openComposer}
              onDeleteGift={openDeleteGift}
              onToggleThankYou={async (g) => {
                try {
                  setPageError(null);
                  if (guestMode) {
                    setGiftsState((prev) =>
                      prev.map((x) => (x.id === g.id ? { ...x, thankYouSent: !x.thankYouSent } : x))
                    );
                  } else {
                    const { thankYouSent } = await toggleThankYouDirect({ id: g.id });
                    setGiftsState((prev) => prev.map((x) => (x.id === g.id ? { ...x, thankYouSent } : x)));
                  }
                } catch (error) {
                  setPageError(
                    error instanceof Error
                      ? error.message
                      : "We couldn't update the thank-you status right now."
                  );
                }
              }}
              guestMode={guestMode}
            />
          </div>
        </section>
      </div>

      {!guestMode && (
        <ReminderSettingsDialog
          isOpen={isListReminderOpen}
          setIsOpen={setIsListReminderOpen}
          listId={listId}
        />
      )}
      {!guestMode && (
        <AddReminderDialog
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          listId={listId}
          initialGiftId={reminderGift ? reminderGift.id : undefined}
        />
      )}

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
          gift={editGift}
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          onUpdated={(g) => {
            setPageError(null);
            setGiftsState((prev) => prev.map((x) => (x.id === g.id ? g : x)));
          }}
          guestMode={guestMode}
          updateGuestGift={updateGuestGift}
        />
      ) : null}

      <AddGiftDialog
        listId={listId}
        isOpen={isAddGiftOpen}
        setIsOpen={setIsAddGiftOpen}
        onCreated={(gift) => {
          setPageError(null);
          if (guestMode) handleGuestGiftCreated(gift);
          else setGiftsState((prev) => [gift, ...prev]);
        }}
        guestMode={guestMode}
        createGuestGift={createGuestGift}
      />

      {deleteGift ? (
        <DeleteGiftDialog
          gift={{ id: deleteGift.id, guestName: deleteGift.guestName }}
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          onDeleted={(id) => {
            setPageError(null);
            setGiftsState((prev) => prev.filter((g) => g.id !== id));
          }}
          guestMode={guestMode}
          onDeleteGuest={deleteGuestGift}
        />
      ) : null}

      {/* Save/Signup Prompt (after 2 gifts) */}
      {guestMode && (
        <SavePromptModal
          isOpen={isSavePromptOpen}
          onClose={() => setIsSavePromptOpen(false)}
          onSaveMyList={onSaveMyList}
          onContinue={onContinueWithoutSaving}
        />
      )}
    </>
  );
}

// ------- Inline modal component to keep changes local -------
function SavePromptModal({
  isOpen,
  onClose,
  onSaveMyList,
  onContinue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveMyList: () => void;
  onContinue: () => void;
}) {
  return (
<Dialog open={isOpen} onOpenChange={(o) => (o ? undefined : onClose())}>
  <DialogContent
    className="
      p-0
      w-[min(calc(100vw-2rem),560px)]
      sm:max-w-[560px]
      rounded-2xl
      border
      bg-white
      shadow-2xl
      overflow-hidden
    "
  >
    {/* Accent bar */}
    <div className="h-1.5 w-full bg-gradient-to-r from-[#A8E6CF] via-[#98CFBA] to-[#8cc4b0]" />

    {/* Two-part layout: scrollable body + sticky footer so actions never overflow */}
    <div className="flex max-h-[85vh] flex-col">
      {/* BODY (scrollable if needed) */}
      <div className="px-5 py-6 sm:px-7 sm:py-7 overflow-y-auto overflow-x-hidden">
        <DialogHeader className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#A8E6CF]/50 bg-[#E0FFF4]/60 px-3 py-1 text-xs font-medium text-[#2f9c79]">
            ✨ Quick setup
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-extrabold leading-snug text-[#1f2937] break-words">
            You’ve started your wedding gift list!
          </DialogTitle>

          <DialogDescription className="text-[15px] sm:text-base leading-relaxed text-gray-600">
            Save your progress so you can come back anytime. It’s free, private, and takes just a few seconds.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits */}
        <ul className="mt-5 space-y-2.5 text-sm sm:text-[15px] text-gray-700">
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#2f9c79]" aria-hidden />
            <span>Access your list from any device</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#2f9c79]" aria-hidden />
            <span>Auto-save thank-you notes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#2f9c79]" aria-hidden />
            <span>Keep gifts safe &amp; never lose track</span>
          </li>
        </ul>
      </div>

      {/* STICKY FOOTER (always visible, stacked buttons to eliminate horizontal overflow) */}
      <div className="sticky bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="justify-center overflow-hidden flex flex-col px-5 py-4 sm:px-7 sm:py-5">
          <DialogFooter className="m-0 p-0 gap-2 sm:flex-col sm:justify-end flex flex-col w-full">
            {/* Primary action */}
            <Button
              variant="outline"
              onClick={onSaveMyList}
              className="
                w-full
                min-h-[48px]
                rounded-xl
                text-xl font-bold text-[#fefefe] hover:text-[#fefefe]
                bg-[linear-gradient(135deg,#A8E6CF_0%,#98CFBA_60%,#8cc4b0_120%)]
                hover:brightness-105
                focus-visible:ring-2 focus-visible:ring-[#98CFBA] focus-visible:ring-offset-2
                border-0
              "
            >
              Save My Gift List
            </Button>

            {/* Secondary action (wrap text; never overflow) */}
            <Button
              variant="ghost"
              onClick={onContinue}
              className="
                w-full
                min-h-[48px]
                rounded-xl
                text-[15px] font-medium text-red-500 hover:text-red-700
                hover:bg-red-300
                whitespace-normal break-words text-center leading-snug
              "
            >
              Continue Without Saving (Your List Can&apos;t Be Saved)
            </Button>
          </DialogFooter>

          <p className="mt-3 text-center text-[12px] text-gray-500">
          Free trial • No Credit Card Required
          </p>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>


  

  );
}
