// src/app/reminders/components/DraftComposerDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useReminders, type Channel, type Relationship, type Tone } from "@/app/contexts/ReminderContext";
import { generateDraft } from "@/lib/draft-templates";
import { ClipboardCopy, RefreshCcw } from "lucide-react";

type GiftLike = {
  id: string;
  listId: string;
  guestName: string;
  description: string;
  date: string;
};

export function DraftComposerDialog({
  isOpen,
  setIsOpen,
  gift,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  gift: GiftLike | null;
}) {
  const { getDraftsForGift, upsertDraft } = useReminders();
  const [channel, setChannel] = React.useState<Channel>("email");
  const [relationship, setRelationship] = React.useState<Relationship>("friend");
  const [tone, setTone] = React.useState<Tone>("warm");
  const [content, setContent] = React.useState("");

  React.useEffect(() => {
    if (!gift) return;
    const drafts = getDraftsForGift(gift.id);
    const current = drafts.find((d) => d.channel === channel);
    if (current) {
      setContent(current.content);
      setRelationship(current.relationship);
      setTone(current.tone);
    } else {
      const generated = generateDraft({
        channel,
        gift: { guestName: gift.guestName, description: gift.description },
        relationship,
        tone,
      });
      setContent(generated);
    }
  }, [gift, channel]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!gift) return null;

  const regenerate = () => {
    const generated = generateDraft({
      channel,
      gift: { guestName: gift.guestName, description: gift.description },
      relationship,
      tone,
    });
    setContent(generated);
  };

  const save = () => {
    upsertDraft({
      listId: gift.listId,
      giftId: gift.id,
      channel,
      content,
      relationship,
      tone,
    });
    setIsOpen(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl w-[min(95vw,42rem)] max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#2d2d2d]">Thank-You Draft for {gift.guestName}</DialogTitle>
        </DialogHeader>

        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3 min-w-0">
          <div className="min-w-0">
            <div className="mb-1 text-xs text-[#2d2d2d]">Channel</div>
            <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0">
            <div className="mb-1 text-xs text-[#2d2d2d]">Relationship</div>
            <Select value={relationship} onValueChange={(v) => setRelationship(v as Relationship)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="coworker">Coworker</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0">
            <div className="mb-1 text-xs text-[#2d2d2d]">Tone</div>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={channel} onValueChange={(v) => setChannel(v as Channel)} className="min-w-0">
          <TabsList className="w-full flex-wrap">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="card">Card</TabsTrigger>
          </TabsList>

          <TabsContent value={channel} className="mt-3 min-w-0">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[220px] w-full max-h-[50vh] resize-none overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words"
              wrap="soft"
            />
            <div className="mt-2 flex gap-2 flex-wrap">
              <Button variant="outline" onClick={regenerate}>
                <RefreshCcw className="h-4 w-4" /> Regenerate
              </Button>
              <Button variant="outline" onClick={copy}>
                <ClipboardCopy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          <Button className="bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]" onClick={save}>
            Save Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}