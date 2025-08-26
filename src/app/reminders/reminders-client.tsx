"use client";

import * as React from "react";
import { useReminders } from "@/app/contexts/ReminderContext";
import { ListSelector } from "@/components/ui/list-selector";
// removed outer Card container for the list calendar to feel airy
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftComposerDialog } from "@/components/DraftComposerDialog";
import { ReminderSettingsDialog } from "@/components/ReminderSettingsDialog";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { generateIcs } from "@/lib/ics";
import { Check, Download, Calendar as CalendarIcon, Clock, Trash2, ChevronDown, FileText } from "lucide-react";
import { channelBadgeClasses } from "@/lib/theme";

type List = { id: string; name: string };

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Helper labels for list-style calendar
function formatMonthLabel(ymd: string) {
  const dt = new Date(ymd + "T00:00:00Z");
  return dt.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
function formatDayParts(ymd: string) {
  const dt = new Date(ymd + "T00:00:00Z");
  return { dow: dt.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" }), day: dt.getUTCDate() } as const;
}

export default function RemindersClient({ listId, lists }: { listId: string; lists: List[] }) {
  const { getAllRemindersForList, rescheduleReminder, markReminderDone, deleteReminder, hydrateListReminders, hydrateListSettings } = useReminders();
  const [pendingOnly, setPendingOnly] = React.useState<boolean>(true);
  const [channelFilter, setChannelFilter] = React.useState<"all" | "email" | "text" | "card">("all");
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

  // Single view only (list calendar)

  // (reserved for future responsive tweaks)

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

  const todayYmd = ymd(new Date());

  // channelBadgeClasses imported from theme

  // No grid calendar days array needed for list calendar

  const remindersByDate = React.useMemo(() => {
    const map = new Map<string, typeof allReminders>();
    for (const r of filteredReminders) {
      const k = r.dueAt;
      if (!map.has(k)) map.set(k, [] as typeof allReminders);
      map.get(k)!.push(r);
    }
    return map;
  }, [filteredReminders]);

  // Selection removed in list calendar; actions are row-level

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

  // Draft open handled inline in menu

  // Bulk actions removed for simplified list calendar

  // Neutral, minimal chip styles
  const chipClass = (active: boolean) =>
    [
      "inline-flex items-center rounded-lg border px-4 py-2 text-base h-11 transition-colors",
      active
        ? "bg-slate-100 text-slate-900 border-slate-300 shadow-inner"
        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
    ].join(" ");

  // Channel tabs config
  const CHANNELS = React.useMemo(
    () => [
      { key: "all" as const, label: "All" },
      { key: "email" as const, label: "Email" },
      { key: "text" as const, label: "Text" },
      { key: "card" as const, label: "Card" },
    ],
    []
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#2d2d2d]">Reminders</h1>
          <p className="mt-1 text-sm text-[#2d2d2d]/70">Plan, reschedule, and complete your thank‑you reminders.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            className="rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            onClick={() => setIsAddOpen(true)}
          >
            Add Reminder
          </Button>
          <Button
            variant="outline"
            className="rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            onClick={() => setIsSettingsOpen(true)}
          >
            Settings
          </Button>
          <Button
            variant="outline"
            className="rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            onClick={exportIcs}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <ListSelector lists={lists} currentListId={listId} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Button
          size="lg"
          variant="outline"
          className={`${chipClass(pendingOnly)} rounded-lg`}
          onClick={() => setPendingOnly((v) => !v)}
        >
          {pendingOnly ? "Pending only" : "All reminders"}
        </Button>
        <div className="flex items-center gap-3 text-base overflow-x-auto whitespace-nowrap">
          <span className="text-[#2d2d2d] mr-1 inline-flex items-center h-11">Channel:</span>
          <Tabs value={channelFilter} onValueChange={(v) => setChannelFilter(v as typeof channelFilter)} className="gap-0">
            <TabsList className="rounded-lg h-11 p-1.5 bg-white border border-slate-200 shadow-sm">
              {CHANNELS.map((c) => (
                <TabsTrigger key={c.key} value={c.key} className="rounded-md px-4 text-base h-9">
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <input
          placeholder="Search…"
          className="h-11 rounded-lg border border-slate-200 px-4 text-base bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="space-y-12">
            {Array.from(remindersByDate.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .reduce<{ month: string; days: Array<{ ymd: string; items: typeof allReminders }> }[]>((acc, [d, items]) => {
                const label = formatMonthLabel(d);
                const last = acc[acc.length - 1];
                if (!last || last.month !== label) acc.push({ month: label, days: [] });
                acc[acc.length - 1].days.push({ ymd: d, items });
                return acc;
              }, [])
              .map((group) => (
                <div key={group.month} className="space-y-8">
                  <div className="px-1 mt-12 mb-6 text-2xl md:text-3xl font-semibold text-slate-700">{group.month}</div>
                  {group.days.map(({ ymd, items }) => {
                    const { dow, day } = formatDayParts(ymd);
                    const isToday = ymd === todayYmd;
                    return (
                      <React.Fragment key={ymd}>
                        {items.map((r) => (
                          <div key={r.id} className={`rounded-xl border shadow-sm overflow-hidden ${r.sent ? "bg-[#EAFBF3] border-[#A8E6CF]" : "bg-white"}`}>
                            <div className="grid grid-cols-[112px_1fr_auto] items-center">
                              {/* Left day column */}
                              <div className={`flex flex-col items-center justify-center border-r py-5 ${r.sent ? "bg-[#E0FFF4]" : "bg-slate-50/60"}`}>
                                <div className={`text-sm font-medium ${r.sent ? "text-[#2d2d2d]" : "text-[#A8E6CF]"}`}>{dow}</div>
                                <div className={`text-5xl font-semibold leading-none ${r.sent ? "text-[#2d2d2d]" : "text-[#A8E6CF]"}`}>{day}</div>
                                {isToday && (
                                  <div className="mt-2 rounded-full bg-[#A8E6CF] px-3 py-1 text-[12px]">Today</div>
                                )}
                              </div>

                              {/* Middle content */}
                              <div className="px-5 py-5 min-w-0">
                                <div className="flex flex-wrap items-center gap-5 text-base">
                                  <span className={`inline-flex items-center ${r.sent ? "text-[#1a1a1a]" : "text-slate-600"}`}>
                                    <Clock className="h-5 w-5 mr-1 text-slate-400" /> Due
                                  </span>
                                  <span className={`font-medium truncate max-w-[14rem] sm:max-w-none ${r.sent ? "text-[#1a1a1a]" : "text-slate-900"}`}>
                                    {r.giftSnapshot.guestName}
                                  </span>
                                  <span className={`truncate ${r.sent ? "text-[#1a1a1a]" : "text-slate-500"}`}>{r.giftSnapshot.description}</span>
                                  <Badge variant="outline" className={`border ${channelBadgeClasses[r.channel]}`}>{r.channel}</Badge>
                                  {r.sent && <Badge className="bg-[#A8E6CF] text-[#1a1a1a]">Done</Badge>}
                                </div>
                              </div>

                              {/* Right actions */}
                              <div className="px-5">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 px-4 py-2"
                                    >
                                      Edit <ChevronDown className="ml-1 h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onSelect={() => openDraftFromReminder(r)}>
                                      <FileText className="h-4 w-4" /> Draft note
                                    </DropdownMenuItem>
                                    {!r.sent && (
                                      <DropdownMenuItem onSelect={() => markReminderDone(r.id)}>
                                        <Check className="h-4 w-4" /> Mark done
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => rescheduleToday(r.id)}>
                                      <CalendarIcon className="h-4 w-4" /> Reschedule to today
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => reschedulePlusOneMonth(r.id, r.dueAt)}>
                                      <CalendarIcon className="h-4 w-4" /> Reschedule +1 month
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onSelect={() => deleteReminder(r.id)}>
                                      <Trash2 className="h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </div>
              ))}
      </div>

      <DraftComposerDialog isOpen={openDraft} setIsOpen={setOpenDraft} gift={draftGift} />
      <ReminderSettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} listId={listId} />
      <AddReminderDialog isOpen={isAddOpen} setIsOpen={setIsAddOpen} listId={listId} />
    </>
  );
}


