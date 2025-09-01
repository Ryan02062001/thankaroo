"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { QuotaBanner, useBillingSummary } from "@/components/QuotaBanner";
import { ComposerToolbar } from "@/components/thankyous/ComposerToolbar";
import { AdvancedOptions } from "@/components/thankyous/AdvancedOptions";
import { MessageSurface } from "@/components/thankyous/MessageSurface";
import { ActionsBar } from "@/components/thankyous/ActionBar";
import { GiftContextCard } from "@/components/thankyous/GiftContextCard";
import { appendMeta, buildMailtoUrl, buildSmsUrl } from "@/components/thankyous/utils";
import type { Channel, Relationship, Tone } from "@/app/contexts/ReminderContext";
import type { Note } from "@/components/thankyous/types";
import type { UIGift } from "@/components/giftlist/types";
import { generateDraft } from "@/lib/draft-templates";
import { generateThankYouDraft } from "@/app/actions/ai";
import { saveThankYouDraftAction, sendThankYouNoteAction, saveThankYouDraftDirect, sendThankYouNoteDirect, type UINote } from "@/app/actions/thankyous";

export function ThankYouComposerDialog({
  isOpen,
  onOpenChange,
  listId,
  gift,
  notes,
  onSaved,
  onSent,
}: {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  listId: string;
  gift: UIGift;
  notes: Note[];
  onSaved: (note: UINote) => void;
  onSent: (note: UINote) => void;
}) {
  const router = useRouter();
  // const { data: billing } = useBillingSummary();

  const [channel, setChannel] = React.useState<Channel>("email");
  const [relationship, setRelationship] = React.useState<Relationship>("friend");
  const [tone, setTone] = React.useState<Tone>("warm");

  const [occasion, setOccasion] = React.useState<string>("wedding");
  const [personalTouch, setPersonalTouch] = React.useState<string>("");

  const [content, setContent] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [mode, setMode] = React.useState<"edit" | "preview">("preview");
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const currentPersistedNote = React.useMemo(() => {
    return notes.find((n) => n.channel === channel) ?? null;
  }, [notes, channel]);

  React.useEffect(() => {
    if (currentPersistedNote) {
      setContent(currentPersistedNote.content);
      setRelationship(currentPersistedNote.relationship);
      setTone(currentPersistedNote.tone);
      setOccasion((currentPersistedNote.meta?.occasion as string) || "wedding");
      setPersonalTouch((currentPersistedNote.meta?.personalTouch as string) || "");
    } else {
      setContent("");
    }
  }, [currentPersistedNote]);

  const saveDraft = async () => {
    try {
      const saved = await saveThankYouDraftDirect({
        id: currentPersistedNote?.id ?? undefined,
        listId,
        giftId: gift.id,
        channel,
        relationship,
        tone,
        content,
        occasion,
        personalTouch,
      });
      onSaved(saved);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch {}
  };

  const generateNote = async () => {
    setIsGenerating(true);
    try {
      const aiDraft = await generateThankYouDraft({
        channel,
        relationship,
        tone,
        occasion,
        personalTouch,
        gift: { guestName: gift.guestName, description: gift.description },
      });
      const finalText = (aiDraft && aiDraft.trim())
        ? aiDraft
        : appendMeta(
            generateDraft({ channel, relationship, tone, gift: { guestName: gift.guestName, description: gift.description } }),
            personalTouch,
            occasion
          );
      setContent(finalText);
      setMode("edit");
    } catch {
      const fallback = appendMeta(
        generateDraft({ channel, relationship, tone, gift: { guestName: gift.guestName, description: gift.description } }),
        personalTouch,
        occasion
      );
      setContent(fallback);
      setMode("edit");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const markSent = async () => {
    try {
      const { note } = await sendThankYouNoteDirect({
        id: currentPersistedNote?.id ?? undefined,
        listId,
        giftId: gift.id,
        channel,
        relationship,
        tone,
        content,
        occasion,
        personalTouch,
      });
      onSent(note);
      onOpenChange(false);
    } catch {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[#2d2d2d]">Compose Thank‑You</DialogTitle>
        </DialogHeader>

        {/* Quota warnings appear only when actions hit a limit */}

        <div className="space-y-5">
          <GiftContextCard gift={gift} />

          <ComposerToolbar
            channel={channel}
            setChannel={setChannel}
            relationship={relationship}
            setRelationship={setRelationship}
            tone={tone}
            setTone={setTone}
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

          <MessageSurface
            content={content}
            onChangeContent={setContent}
            isGenerating={isGenerating}
            mode={mode}
            setMode={setMode}
            showEditHint={!currentPersistedNote}
            canEdit={!isGenerating}
          />

          <ActionsBar
            isGenerating={isGenerating}
            canGenerate={true}
            onGenerate={generateNote}
            canSave={!!content}
            onSave={saveDraft}
            saved={saved}
            canCopy={!!content}
            onCopy={copyToClipboard}
            copied={copied}
            showEmailButton={!!content && channel === "email"}
            emailHref={buildMailtoUrl("Thank you!", content)}
            showSmsButton={!!content && channel === "text"}
            smsHref={buildSmsUrl(content)}
            showPrintButton={!!content && channel === "card"}
            onPrint={() => window.print()}
            canMarkSent={!!content}
            onMarkSent={markSent}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
