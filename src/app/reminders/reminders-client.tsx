"use client";

import * as React from "react";
import { useReminders } from "@/app/contexts/ReminderContext";
import { ListSelector } from "@/components/ui/list-selector";
import { DraftComposerDialog } from "@/components/DraftComposerDialog";
import { ReminderSettingsDialog } from "@/components/ReminderSettingsDialog";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { generateIcs } from "@/lib/ics";
import { getMonthKey, ymd } from "@/components/reminders/utils";
import Header from "@/components/reminders/Header";
import FiltersBar, { type ChannelFilter } from "@/components/reminders/FiltersBar";
import ReminderList from "@/components/reminders/ReminderList";

type List = { id: string; name: string };

export default function RemindersClient({ listId, lists }: { listId: string; lists: List[] }) {
  const { getAllRemindersForList, rescheduleReminder, markReminderDone, deleteReminder, hydrateListReminders, hydrateListSettings } = useReminders();
  const [pendingOnly, setPendingOnly] = React.useState<boolean>(true);
  const [channelFilter, setChannelFilter] = React.useState<ChannelFilter>("all");
  const [search, setSearch] = React.useState<string>("");
  const [openDraft, setOpenDraft] = React.useState(false);
  const [draftGift, setDraftGift] = React.useState<{
    id: string; listId: string; guestName: string; description: string; date: string;
  } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  React.useEffect(() => {
    void hydrateListSettings(listId);
    void hydrateListReminders(listId);
  }, [listId, hydrateListReminders, hydrateListSettings]);

  const allReminders = getAllRemindersForList(listId, { includeSent: true });

  const filteredReminders = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return allReminders.filter((r) => {
      if (pendingOnly && r.sent) return false;
      if (channelFilter !== "all" && r.channel !== channelFilter) return false;
      if (term) {
        const hay = `${r.giftSnapshot.guestName} ${r.giftSnapshot.description}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [allReminders, pendingOnly, channelFilter, search]);

  const openDraftFromReminder = (r: (typeof allReminders)[number]) => {
    setDraftGift({
      id: r.giftId,
      listId: r.listId,
      guestName: r.giftSnapshot.guestName,
      description: r.giftSnapshot.description,
      date: r.giftSnapshot.date,
    });
    setOpenDraft(true);
  };

  const rescheduleToday = (reminderId: string) => {
    rescheduleReminder(reminderId, ymd(new Date()));
  };

  const reschedulePlusOneMonth = (reminderId: string, dueYmd: string) => {
    const d = new Date(dueYmd + "T00:00:00Z");
    const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    rescheduleReminder(reminderId, ymd(next));
  };

  const exportIcs = () => {
    const events = filteredReminders
      .filter((r) => !r.sent)
      .map((r) => ({
        id: r.id,
        title: `Thankaroo: ${r.giftSnapshot.guestName}`,
        description: `${r.giftSnapshot.description} (${r.channel})`,
        dateYmd: r.dueAt,
      }));
    const ics = generateIcs(events);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thankaroo-reminders-${getMonthKey(new Date())}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header onOpenAdd={() => setIsAddOpen(true)} onOpenSettings={() => setIsSettingsOpen(true)} onExport={exportIcs} />

      <div className="mb-6">
        <ListSelector lists={lists} currentListId={listId} />
      </div>

      <FiltersBar
        pendingOnly={pendingOnly}
        setPendingOnly={setPendingOnly}
        channelFilter={channelFilter}
        setChannelFilter={setChannelFilter}
        search={search}
        setSearch={setSearch}
      />

      <ReminderList
        reminders={filteredReminders as any}
        onDraft={(r) => openDraftFromReminder(r as any)}
        onMarkDone={(id) => markReminderDone(id)}
        onReschedToday={(id) => rescheduleToday(id)}
        onReschedPlusMonth={(id, due) => reschedulePlusOneMonth(id, due)}
        onDelete={(id) => deleteReminder(id)}
      />

      <DraftComposerDialog isOpen={openDraft} setIsOpen={setOpenDraft} gift={draftGift} />
      <ReminderSettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} listId={listId} />
      <AddReminderDialog isOpen={isAddOpen} setIsOpen={setIsAddOpen} listId={listId} />
    </>
  );
}


