"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles } from "lucide-react";

import { QuotaBanner, useBillingSummary } from "@/components/QuotaBanner";
import {
  useReminders,
  type Channel,
  type Relationship,
  type Tone,
} from "@/app/contexts/ReminderContext";
import { generateDraft } from "@/lib/draft-templates";
import { generateThankYouDraft } from "@/app/actions/ai";
import { saveThankYouDraftAction, sendThankYouNoteAction } from "@/app/actions/thankyous";

import type { UIGift, Note, StatusFilter } from "@/components/thankyous/types";
import { OverviewBar } from "@/components/thankyous/OverviewBar";
import { PeoplePanel } from "@/components/thankyous/PeoplePanel";
import { GiftContextCard } from "@/components/thankyous/GiftContextCard";
import { GiftChips } from "@/components/thankyous/GiftChips";
import { ComposerToolbar } from "@/components/thankyous/ComposerToolbar";
import { AdvancedOptions } from "@/components/thankyous/AdvancedOptions";
import { MessageSurface } from "@/components/thankyous/MessageSurface";
import { ActionsBar } from "@/components/thankyous/ActionBar";
import { EmptyState } from "@/components/thankyous/EmptyState";
import { appendMeta, buildMailtoUrl, buildSmsUrl, escapeHtml } from "@/components/thankyous/utils";

export default function ThankYousClient({
  listId,
  gifts,
  notes,
}: {
  listId: string;
  gifts: UIGift[];
  notes: Note[];
}) {
  const router = useRouter();
  const { getDraftsForGift } = useReminders();
  const { data: billing } = useBillingSummary();

  // High-level counts (gift-based for the top bar)
  const counts = React.useMemo(() => {
    const total = gifts.length;
    const sent = gifts.filter((g) => g.thankYouSent).length;
    const pending = total - sent;
    return { total, sent, pending, pct: total ? Math.round((sent / total) * 100) : 0 };
  }, [gifts]);

  // ===== Filters & Search (PERSON-LEVEL) =====
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("pending"); // default pending
  const [query, setQuery] = React.useState("");

  // Build person -> gifts map (unfiltered)
  const people = React.useMemo(() => {
    const map = new Map<string, UIGift[]>();
    gifts.forEach((g) => {
      const key = (g.guestName || "Unknown").trim();
      map.set(key, [...(map.get(key) ?? []), g]);
    });
    // sort keys alphabetically
    return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  }, [gifts]);

  // Per-person summary for progress bars
  const personSummary = React.useMemo(() => {
    const m = new Map<string, { total: number; sent: number; pending: number }>();
    people.forEach((list, name) => {
      const total = list.length;
      const sent = list.filter((g) => g.thankYouSent).length;
      m.set(name, { total, sent, pending: total - sent });
    });
    return m;
  }, [people]);

  // Person-level classification
  const { pendingPeopleCount, sentPeopleCount, filteredPersonList } = React.useMemo(() => {
    const names = [...people.keys()];
    let pendingCount = 0;
    let sentCount = 0;

    const meta = new Map<string, { anySent: boolean; anyPending: boolean }>();
    names.forEach((name) => {
      const list = people.get(name)!;
      const anySent = list.some((g) => g.thankYouSent);
      const anyPending = list.some((g) => !g.thankYouSent);
      meta.set(name, { anySent, anyPending });
      // counts per PERSON
      if (!anySent && anyPending) pendingCount += 1; // never thanked yet
      if (anySent) sentCount += 1;                   // at least one thanked
    });

    // Status filter at PERSON level
    const baseFilteredByStatus = names.filter((name) => {
      const m = meta.get(name)!;
      if (statusFilter === "pending") {
        return !m.anySent && m.anyPending; // only those with zero sent
      } else {
        return m.anySent;                   // anyone who has at least one sent
      }
    });

    // Search by person name
    const q = query.trim().toLowerCase();
    const filtered = q
      ? baseFilteredByStatus.filter((name) => name.toLowerCase().includes(q))
      : baseFilteredByStatus;

    return {
      pendingPeopleCount: pendingCount,
      sentPeopleCount: sentCount,
      filteredPersonList: filtered,
    };
  }, [people, statusFilter, query]);

  // Selected person must be from filtered list
  const [selectedPerson, setSelectedPerson] = React.useState<string | null>(filteredPersonList[0] ?? null);
  React.useEffect(() => {
    if (!filteredPersonList.length) {
      setSelectedPerson(null);
      return;
    }
    if (!selectedPerson || !filteredPersonList.includes(selectedPerson)) {
      setSelectedPerson(filteredPersonList[0]);
    }
  }, [filteredPersonList, selectedPerson]);

  // Gifts for selected person
  const personGifts = React.useMemo(
    () => (selectedPerson ? people.get(selectedPerson) ?? [] : []),
    [people, selectedPerson]
  );

  // Gift-level filter mirrors the active tab (pending vs sent)
  const personGiftsFiltered = React.useMemo(() => {
    if (statusFilter === "pending") return personGifts.filter((g) => !g.thankYouSent);
    return personGifts.filter((g) => g.thankYouSent);
  }, [personGifts, statusFilter]);

  // Selected gift
  const [selectedGiftId, setSelectedGiftId] = React.useState<string | null>(personGiftsFiltered[0]?.id ?? null);
  React.useEffect(() => {
    const first = personGiftsFiltered[0]?.id ?? null;
    setSelectedGiftId((prev) => (personGiftsFiltered.some((g) => g.id === prev) ? prev : first));
  }, [personGiftsFiltered]);
  const selectedGift = React.useMemo(
    () => personGiftsFiltered.find((g) => g.id === selectedGiftId) ?? null,
    [personGiftsFiltered, selectedGiftId]
  );

  // ===== Composer State (typed to avoid `any`) =====
  const [channel, setChannelState] = React.useState<Channel>("email");
  const [relationship, setRelationshipState] = React.useState<Relationship>("friend");
  const [tone, setToneState] = React.useState<Tone>("warm");
  const [occasion, setOccasion] = React.useState<string>("wedding");
  const [personalTouch, setPersonalTouch] = React.useState<string>("");
  const [content, setContent] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [mode, setMode] = React.useState<"edit" | "preview">("preview");
  const [showEditHint, setShowEditHint] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Persisted notes lookup
  const notesByGift = React.useMemo(() => {
    const m = new Map<string, Note[]>();
    for (const n of notes) {
      const arr = m.get(n.gift_id) ?? [];
      arr.push(n);
      m.set(n.gift_id, arr);
    }
    return m;
  }, [notes]);

  const currentPersistedNote = React.useMemo(
    () => (selectedGift ? (notesByGift.get(selectedGift.id) ?? []).find((n) => n.channel === channel) ?? null : null),
    [selectedGift, channel, notesByGift]
  );

  // Load content from persisted note or local draft
  React.useEffect(() => {
    if (!selectedGift) {
      setContent("");
      return;
    }
    const persisted = currentPersistedNote;
    if (persisted) {
      setContent(persisted.content);
      setRelationshipState(persisted.relationship);
      setToneState(persisted.tone);
      setOccasion(persisted.meta?.occasion || "wedding");
      setPersonalTouch(persisted.meta?.personalTouch || "");
    } else {
      const drafts = getDraftsForGift(selectedGift.id);
      const current = drafts.find((d) => d.channel === channel);
      if (current) {
        setContent(current.content);
        setRelationshipState(current.relationship);
        setToneState(current.tone);
      } else {
        setContent("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGift, channel, currentPersistedNote]);

  // Actions
  const saveDraft = async () => {
    if (!selectedGift) return;
    const form = new FormData();
    form.set("note_id", currentPersistedNote?.id ?? "");
    form.set("list_id", listId);
    form.set("gift_id", selectedGift.id);
    form.set("channel", channel);
    form.set("relationship", relationship);
    form.set("tone", tone);
    form.set("content", content);
    form.set("occasion", occasion);
    form.set("personal_touch", personalTouch);
    await saveThankYouDraftAction(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const generateNote = async () => {
    if (!selectedGift) return;
    setIsGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      const aiDraft = await generateThankYouDraft({
        channel,
        relationship,
        tone,
        occasion,
        personalTouch,
        gift: { guestName: selectedGift.guestName, description: selectedGift.description },
      });
      if (aiDraft && aiDraft.trim()) {
        setContent(aiDraft);
      } else {
        const fallback = generateDraft({
          channel,
          gift: { guestName: selectedGift.guestName, description: selectedGift.description },
          relationship,
          tone,
        });
        setContent(appendMeta(fallback, personalTouch, occasion));
      }
      setMode("edit");
      setShowEditHint(true);
    } catch {
      const fallback = generateDraft({
        channel,
        gift: { guestName: selectedGift.guestName, description: selectedGift.description },
        relationship,
        tone,
      });
      setContent(appendMeta(fallback, personalTouch, occasion));
      setMode("edit");
      setShowEditHint(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const printNote = (text: string) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Thank You Note</title>
<style>
body{background:#fff;font-family:ui-serif,Georgia,serif;color:#2d2d2d;line-height:1.7;margin:0;padding:40px}
.sheet{max-width:720px;margin:0 auto;border:1px solid #eee;border-radius:16px;padding:32px;box-shadow:0 10px 30px rgba(0,0,0,.06)}
pre{white-space:pre-wrap;word-break:break-word}
</style></head><body><div class="sheet"><pre>${escapeHtml(text)}</pre></div></body></html>`;
    w.document.open(); w.document.write(html); w.document.close(); w.focus(); w.print();
  };

  const fireConfetti = () => {
    if (typeof window === "undefined") return;
    const count = 24;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.textContent = Math.random() > 0.5 ? "🎉" : "✨";
      s.style.position = "fixed";
      s.style.left = `${window.innerWidth / 2}px`;
      s.style.top = `${window.innerHeight / 2}px`;
      s.style.fontSize = `${12 + Math.random() * 14}px`;
      s.style.pointerEvents = "none";
      s.style.zIndex = "9999";
      document.body.appendChild(s);
      const dx = (Math.random() - 0.5) * window.innerWidth;
      const dy = (Math.random() - 0.1) * window.innerHeight;
      s.animate(
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
        ],
        { duration: 1200 + Math.random() * 600, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
      ).finished.finally(() => s.remove());
    }
  };

  // Empty state when no names match the current tab+search
  if (!filteredPersonList.length) {
    return <EmptyState onClear={() => { setQuery(""); setStatusFilter("pending"); }} />;
  }

  return (
    <div className="space-y-6 overflow-hidden">
      <OverviewBar sent={counts.sent} total={counts.total} pending={counts.pending} />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* Left panel (filters + names) */}
        <div className="space-y-6">
          <PeoplePanel
            pendingPeopleCount={pendingPeopleCount}
            sentPeopleCount={sentPeopleCount}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            query={query}
            setQuery={setQuery}
            filteredPersonList={filteredPersonList}
            selectedPerson={selectedPerson}
            onSelectPerson={setSelectedPerson}
            personSummary={personSummary}
          />
        </div>

        {/* Right card (composer) */}
        <Card className="bg-white/80 border border-gray-200/60 shadow-sm backdrop-blur lg:sticky lg:top-28 h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-[#2d2d2d]">
              <Heart className="h-5 w-5 text-[#A8E6CF]" />
              <span>Your Thank You Note</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {billing ? <QuotaBanner context="ai" /> : null}

            {!selectedGift ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#2d2d2d] mb-2">Select a gift to get started</h3>
                <p className="text-gray-600 max-w-sm">Choose a person on the left and we&apos;ll help you write a beautiful note.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <GiftContextCard gift={selectedGift} />

                {personGiftsFiltered.length > 1 && (
                  <GiftChips
                    gifts={personGiftsFiltered}
                    selectedGiftId={selectedGiftId}
                    onSelectGift={setSelectedGiftId}
                  />
                )}

                <ComposerToolbar
                  channel={channel}
                  setChannel={(v: Channel) => setChannelState(v)}
                  relationship={relationship}
                  setRelationship={(v: Relationship) => setRelationshipState(v)}
                  tone={tone}
                  setTone={(v: Tone) => setToneState(v)}
                  showAdvanced={showAdvanced}
                  toggleAdvanced={() => setShowAdvanced((s) => !s)}
                />

                {showAdvanced && (
                  <AdvancedOptions
                    occasion={occasion}
                    setOccasion={setOccasion}
                    personalTouch={personalTouch}
                    setPersonalTouch={setPersonalTouch}
                  />
                )}

                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="text-sm font-medium text-[#2d2d2d]">Your message</div>
                </div>

                <MessageSurface
                  content={content}
                  onChangeContent={setContent}
                  isGenerating={isGenerating}
                  mode={mode}
                  setMode={setMode}
                  showEditHint={showEditHint}
                  canEdit={!isGenerating && !!selectedGift}
                />

                <ActionsBar
                  isGenerating={isGenerating}
                  canGenerate={!!selectedGift}
                  onGenerate={generateNote}
                  canSave={!!content && !!selectedGift && !isGenerating}
                  onSave={saveDraft}
                  saved={saved}
                  canCopy={!!content && !!selectedGift && !isGenerating}
                  onCopy={copyToClipboard}
                  copied={copied}
                  showEmailButton={!!content && channel === "email"}
                  emailHref={buildMailtoUrl("Thank you!", content)}
                  showSmsButton={!!content && channel === "text"}
                  smsHref={buildSmsUrl(content)}
                  showPrintButton={!!content && channel === "card"}
                  onPrint={() => printNote(content)}
                  canMarkSent={!!selectedGift && !!content.trim() && !isGenerating}
                  onMarkSent={async () => {
                    if (!selectedGift || !content.trim()) return;
                    const form = new FormData();
                    form.set("note_id", (currentPersistedNote && currentPersistedNote.id) || "");
                    form.set("list_id", listId);
                    form.set("gift_id", selectedGift.id);
                    form.set("channel", channel);
                    form.set("relationship", relationship);
                    form.set("tone", tone);
                    form.set("content", content);
                    form.set("occasion", occasion);
                    form.set("personal_touch", personalTouch);
                    await sendThankYouNoteAction(form);
                    setTimeout(fireConfetti, 0);
                    router.refresh();
                  }}
                />

                <div className="text-xs text-gray-600 bg-white/70 border border-gray-200/70 rounded-lg p-3 shadow-sm">
                  💡 <strong>Tip:</strong> Use the toolbar to tailor tone and relationship. Open “More” for occasion and personal touches.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
