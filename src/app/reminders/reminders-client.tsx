"use client";

import * as React from "react";
import { useReminders } from "@/app/contexts/ReminderContext";
import { ListSelector } from "@/components/ui/list-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DraftComposerDialog } from "@/components/DraftComposerDialog";
import { ReminderSettingsDialog } from "@/components/ReminderSettingsDialog";
import { AddReminderDialog } from "@/components/AddReminderDialog";
import { generateIcs } from "@/lib/ics";
import { Calendar, Check, Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import { channelBadgeClasses, channelPillButtonActive, channelBorderClasses } from "@/lib/theme";

type List = { id: string; name: string };

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
}

function addMonths(d: Date, n: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
}

export default function RemindersClient({ listId, lists }: { listId: string; lists: List[] }) {
  const { getAllRemindersForList, rescheduleReminder, markReminderDone, deleteReminder, markManyDone, deleteMany, hydrateListReminders, hydrateListSettings, setReminderSent } = useReminders();

  const [view, setView] = React.useState<"calendar" | "list">("calendar");
  const [month, setMonth] = React.useState<Date>(startOfMonth(new Date()));
  const [selectedYmd, setSelectedYmd] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [pendingOnly, setPendingOnly] = React.useState<boolean>(true);
  const [channelFilter, setChannelFilter] = React.useState<"all" | "email" | "text" | "card">("all");
  const [search, setSearch] = React.useState<string>("");
  const [openDraft, setOpenDraft] = React.useState(false);
  const [draftGift, setDraftGift] = React.useState<{
    id: string; listId: string; guestName: string; description: string; date: string;
  } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isSmall, setIsSmall] = React.useState(false);

  React.useEffect(() => {
    void hydrateListSettings(listId);
    void hydrateListReminders(listId);
  }, [listId, hydrateListReminders, hydrateListSettings]);

  // Prefer list view on small screens; persist user choice
  React.useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("thankaroo.reminders.view") : null;
      if (saved === "calendar" || saved === "list") {
        setView(saved as "calendar" | "list");
      } else if (typeof window !== "undefined") {
        const prefersList = window.matchMedia("(max-width: 640px)").matches;
        if (prefersList) setView("list");
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("thankaroo.reminders.view", view);
    } catch {}
  }, [view]);

  // Track small screens to adjust calendar density
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 640px)");
    const update = () => setIsSmall(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

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

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const todayYmd = ymd(new Date());

  // channelBadgeClasses imported from theme

  const days: Date[] = [];
  {
    // grid from Sunday before monthStart to Saturday after monthEnd
    const start = new Date(monthStart);
    const startDow = start.getUTCDay();
    start.setUTCDate(1 - startDow);
    const end = new Date(monthEnd);
    const endDow = end.getUTCDay();
    end.setUTCDate(end.getUTCDate() + (6 - endDow));
    const cur = new Date(start);
    while (cur <= end) {
      days.push(new Date(cur));
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  }

  const remindersByDate = React.useMemo(() => {
    const map = new Map<string, typeof allReminders>();
    for (const r of filteredReminders) {
      const k = r.dueAt;
      if (!map.has(k)) map.set(k, [] as typeof allReminders);
      map.get(k)!.push(r);
    }
    return map;
  }, [filteredReminders]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelected = () => setSelectedIds(new Set());

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
    a.download = `thankaroo-reminders-${getMonthKey(month)}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onOpenDraft = (r: (typeof allReminders)[number]) => {
    setDraftGift({
      id: r.giftId,
      listId: r.listId,
      guestName: r.giftSnapshot.guestName,
      description: r.giftSnapshot.description,
      date: r.giftSnapshot.date,
    });
    setOpenDraft(true);
  };

  const onBulkDone = () => {
    markManyDone(Array.from(selectedIds));
    clearSelected();
  };

  const onBulkDelete = () => {
    deleteMany(Array.from(selectedIds));
    clearSelected();
  };

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
            className={view === "calendar" ? "bg-[#A8E6CF] text-[#1a1a1a] border-[#8ed0be] hover:bg-[#98CFBA]" : "hover:border-[#A8E6CF] hover:bg-[#A8E6CF]/20"}
            onClick={() => setView("calendar")}
          >
            Calendar
          </Button>
          <Button
            variant="outline"
            className={view === "list" ? "bg-[#A8E6CF] text-[#1a1a1a] border-[#8ed0be] hover:bg-[#98CFBA]" : "hover:border-[#A8E6CF] hover:bg-[#A8E6CF]/20"}
            onClick={() => setView("list")}
          >
            List
          </Button>
          <Button variant="outline" className="bg-[#A8E6CF] text-[#1a1a1a] border-[#8ed0be] hover:bg-[#98CFBA]" onClick={() => setIsAddOpen(true)}>Add Reminder</Button>
          <Button variant="outline" className="hover:border-[#A8E6CF] hover:bg-[#A8E6CF]/20" onClick={() => setIsSettingsOpen(true)}>Settings</Button>
          <Button variant="outline" className="hover:border-[#A8E6CF] hover:bg-[#A8E6CF]/20" onClick={exportIcs}><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      <div className="mb-6">
        <ListSelector lists={lists} currentListId={listId} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className={pendingOnly ? "bg-[#A8E6CF] text-[#1a1a1a] border-[#8ed0be] hover:bg-[#98CFBA]" : "hover:border-[#A8E6CF] hover:bg-[#A8E6CF]/20"}
          onClick={() => setPendingOnly((v) => !v)}
        >
          {pendingOnly ? "Showing Pending" : "Showing All"}
        </Button>
        <div className="flex items-center gap-1 text-sm overflow-x-auto whitespace-nowrap">
          <span className="text-[#2d2d2d]">Channel:</span>
          {["all","email","text","card"].map((c) => (
            <Button
              key={c}
              size="sm"
              variant="outline"
              className={channelFilter === c ? channelPillButtonActive[c as keyof typeof channelPillButtonActive] : "hover:border-[#A8E6CF] hover:bg-[#A8E6CF]/20"}
              onClick={() => setChannelFilter(c as typeof channelFilter)}
            >
              {c}
            </Button>
          ))}
        </div>
        <input
          placeholder="Search…"
          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-[#A8E6CF]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {view === "calendar" ? (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-end">
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={onBulkDone}><Check className="h-4 w-4" /> Mark done</Button>
                  <Button size="sm" variant="outline" onClick={onBulkDelete}><X className="h-4 w-4" /> Delete</Button>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
              {/* Sidebar (md+) */}
              <aside className="hidden md:block md:pr-6 md:border-r md:border-gray-200/70">
                <div className="mb-4 rounded-2xl border bg-white p-3 shadow-sm">
                  <div className="mb-2 text-sm font-semibold text-[#2d2d2d]">Filters</div>
                  <div className="space-y-2 text-sm">
                    {["all","email","text","card"].map((c) => (
                      <button
                        key={c}
                        className={`flex w-full items-center justify-between rounded-lg border px-2 py-1 ${channelFilter === c ? channelPillButtonActive[c as keyof typeof channelPillButtonActive] : "hover:border-[#A8E6CF] hover:bg-[#A8E6CF]/20"}`}
                        onClick={() => setChannelFilter(c as typeof channelFilter)}
                      >
                        <span className="capitalize">{c}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-3 shadow-sm">
                  <div className="grid grid-cols-7 gap-1 text-[10px] text-gray-500">
                    {["S","M","T","W","T","F","S"].map((d, i) => (
                      <div key={`mini-${i}`} className="text-center py-0.5">{d}</div>
                    ))}
                    {days.map((d) => {
                      const key = ymd(d);
                      const isCurrentMonth = d.getUTCMonth() === month.getUTCMonth();
                      const count = remindersByDate.get(key)?.length ?? 0;
                      return (
                        <div key={key} className={`relative rounded-md border text-center py-1 ${isCurrentMonth ? "bg-white" : "bg-gray-50"}`}>
                          <span className="text-[11px] text-[#2d2d2d]">{d.getUTCDate()}</span>
                          {count > 0 && (
                            <span className="absolute right-0.5 top-0.5 inline-flex items-center justify-center rounded-full bg-[#A8E6CF] text-[10px] text-[#1a1a1a] px-1">{count}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Main month grid */}
              <div className="md:pl-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-2xl font-bold text-[#2d2d2d]">
                    {new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1)).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, -1))}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 md:gap-3">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => (
                    <div key={`hdr-${i}`} className="text-[11px] uppercase tracking-wide text-gray-500 font-medium px-2 py-1">{d}</div>
                  ))}
                  {days.map((d) => {
                    const key = ymd(d);
                    const isCurrentMonth = d.getUTCMonth() === month.getUTCMonth();
                    const items = remindersByDate.get(key) ?? [];
                    return (
                      <div
                        key={key}
                        className={`min-h-[90px] sm:min-h-[120px] rounded-2xl border p-2 transition-colors shadow-sm ${
                          isCurrentMonth ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between text-xs text-[#2d2d2d]">
                          <span className="flex items-center gap-1">
                            {d.getUTCDate()}
                            {isCurrentMonth && key === todayYmd && (
                              <span className="rounded-full bg-[#A8E6CF] text-[#1a1a1a] px-1.5 py-0.5 text-[10px]">Today</span>
                            )}
                          </span>
                          {selectedYmd === key && (
                            <button onClick={() => setSelectedYmd(null)} className="text-gray-400">Clear</button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {items.slice(0, isSmall ? 2 : 3).map((r) => {
                            const selected = selectedIds.has(r.id);
                            const isSent = r.sent;
                            return (
                              <div
                                key={r.id}
                                className={`flex items-center justify-between gap-2 rounded-xl border px-2 py-1 transition-colors ${
                                  isSent
                                    ? `bg-[#EAFBF3] border-[#A8E6CF] ${channelBorderClasses[r.channel]}`
                                    : selected
                                    ? `bg-[#A8E6CF]/30 border-[#A8E6CF] hover:bg-[#A8E6CF]/40 ${channelBorderClasses[r.channel]}`
                                    : `bg-white hover:bg-gray-50 ${channelBorderClasses[r.channel]}`
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`truncate text-xs font-medium ${isSent ? "text-[#1f4d3d]" : "text-[#2d2d2d]"}`}>{r.giftSnapshot.guestName}</span>
                                    <Badge variant="outline" className={`border ${channelBadgeClasses[r.channel]}`}>{r.channel}</Badge>
                                    {isSent && <Badge className="bg-[#A8E6CF] text-[#1a1a1a]">Done</Badge>}
                                  </div>
                                </div>
                                <input type="checkbox" checked={isSent || selected} onChange={() => (isSent ? setReminderSent(r.id, false) : toggleSelected(r.id))} />
                              </div>
                            );
                          })}
                          {items.length > (isSmall ? 2 : 3) && (
                            <button className="text-xs text-blue-600" onClick={() => setSelectedYmd(key)}>+{items.length - (isSmall ? 2 : 3)} more</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedYmd && (
              <div className="mt-4 rounded-lg border bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#2d2d2d]"><Calendar className="h-4 w-4" /> {selectedYmd}</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={onBulkDone}><Check className="h-4 w-4" /> Mark done</Button>
                    <Button size="sm" variant="outline" onClick={onBulkDelete}><X className="h-4 w-4" /> Delete</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(remindersByDate.get(selectedYmd) ?? []).map((r) => (
                    <div key={r.id} className={`rounded border p-2 ${r.sent ? "bg-[#EAFBF3] border-[#A8E6CF]" : "bg-white"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${r.sent ? "text-[#1f4d3d]" : "text-[#2d2d2d]"}`}>{r.giftSnapshot.guestName}</span>
                            <Badge variant="outline" className={`border ${channelBadgeClasses[r.channel]}`}>{r.channel}</Badge>
                            {r.sent && <Badge className="bg-[#A8E6CF] text-[#1a1a1a]">Done</Badge>}
                          </div>
                          <div className="mt-0.5 text-xs text-[#2d2d2d] truncate">{r.giftSnapshot.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => onOpenDraft(r)}>Draft</Button>
                          {!r.sent && (
                            <>
                              <Button size="sm" onClick={() => markReminderDone(r.id)}><Check className="h-4 w-4" /> Done</Button>
                              <Button size="sm" variant="outline" onClick={() => rescheduleReminder(r.id, ymd(new Date()))}>Today</Button>
                              <Button size="sm" variant="outline" onClick={() => rescheduleReminder(r.id, ymd(new Date(Date.UTC(new Date(r.dueAt + "T00:00:00Z").getUTCFullYear(), new Date(r.dueAt + "T00:00:00Z").getUTCMonth() + 1, 1))))}>+1mo</Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" onClick={() => deleteReminder(r.id)}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-[#2d2d2d]">All reminders</div>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={onBulkDone}><Check className="h-4 w-4" /> Mark done</Button>
                  <Button size="sm" variant="outline" onClick={onBulkDelete}><X className="h-4 w-4" /> Delete</Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {filteredReminders.map((r) => {
                const selected = selectedIds.has(r.id);
                return (
                  <div key={r.id} className={`rounded border p-2 ${r.sent ? "bg-[#EAFBF3] border-[#A8E6CF]" : selected ? "bg-[#A8E6CF]/30 border-[#A8E6CF]" : "bg-white"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${r.sent ? "text-[#1f4d3d]" : "text-[#2d2d2d]"}`}>{r.giftSnapshot.guestName}</span>
                          <Badge variant="outline" className={`border ${channelBadgeClasses[r.channel]}`}>{r.channel}</Badge>
                          <span className="text-xs text-gray-500">Due {new Date(r.dueAt + "T00:00:00Z").toLocaleDateString("en-US")}</span>
                          {r.sent && <Badge className="bg-[#A8E6CF] text-[#2d2d2d]">Done</Badge>}
                        </div>
                        <div className="mt-0.5 text-xs text-[#2d2d2d] truncate">{r.giftSnapshot.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={r.sent || selected}
                          onChange={(e) => (r.sent ? setReminderSent(r.id, e.target.checked) : toggleSelected(r.id))}
                        />
                        <Button size="sm" variant="outline" onClick={() => onOpenDraft(r)}>Draft</Button>
                        {!r.sent ? (
                          <>
                            <Button size="sm" onClick={() => markReminderDone(r.id)}><Check className="h-4 w-4" /> Done</Button>
                            <Button size="sm" variant="outline" onClick={() => rescheduleReminder(r.id, ymd(new Date()))}>Today</Button>
                          </>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={() => deleteReminder(r.id)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <DraftComposerDialog isOpen={openDraft} setIsOpen={setOpenDraft} gift={draftGift} />
      <ReminderSettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} listId={listId} />
      <AddReminderDialog isOpen={isAddOpen} setIsOpen={setIsAddOpen} listId={listId} />
    </>
  );
}


