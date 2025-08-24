// src/app/reminders/components/UpcomingRemindersCard.tsx
"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReminders } from "@/app/contexts/ReminderContext";
import { Calendar, Check, FileText } from "lucide-react";
import { DraftComposerDialog } from "./DraftComposerDialog";
import { channelBadgeClasses } from "@/lib/theme";

export function UpcomingRemindersCard({ listId }: { listId: string }) {
  const { getRemindersForList, markReminderDone } = useReminders();
  const reminders = getRemindersForList(listId).slice(0, 5);

  const [open, setOpen] = React.useState(false);
  const [giftCtx, setGiftCtx] = React.useState<{
    id: string; listId: string; guestName: string; description: string; date: string;
  } | null>(null);

  const openDraft = (r: ReturnType<typeof getRemindersForList>[number]) => {
    setGiftCtx({
      id: r.giftId,
      listId: r.listId,
      guestName: r.giftSnapshot.guestName,
      description: r.giftSnapshot.description,
      date: r.giftSnapshot.date,
    });
    setOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent>
          <h3 className="mb-4 font-semibold text-[#2d2d2d]">Upcoming Thank-You Reminders</h3>
          {reminders.length === 0 ? (
            <div className="text-sm text-[#2d2d2d]">All caught up! No upcoming reminders.</div>
          ) : (
            <div className="space-y-3">
              {reminders.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#2d2d2d]">{r.giftSnapshot.guestName}</span>
                      <Badge variant="outline" className={`border ${channelBadgeClasses[r.channel]}`}>{r.channel}</Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-[#2d2d2d]">
                      <Calendar className="h-3 w-3" />
                      Due {new Date(r.dueAt + "T00:00:00Z").toLocaleDateString("en-US")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDraft(r)}>
                      <FileText className="h-4 w-4" /> Draft
                    </Button>
                    <Button size="sm" className="bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]" onClick={() => markReminderDone(r.id)}>
                      <Check className="h-4 w-4" /> Done
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DraftComposerDialog isOpen={open} setIsOpen={setOpen} gift={giftCtx} />
    </>
  );
}


