"use client";

import * as React from "react";
import ReminderRow, { type ReminderRowData } from "./ReminderRow";

function ymd(d: Date) { return d.toISOString().slice(0, 10); }
function formatMonthLabel(ymdStr: string) {
  const dt = new Date(ymdStr + "T00:00:00Z");
  return dt.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
function formatDayParts(ymdStr: string) {
  const dt = new Date(ymdStr + "T00:00:00Z");
  return { dow: dt.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" }), day: dt.getUTCDate() } as const;
}

export default function ReminderList({ reminders, onDraft, onMarkDone, onReschedToday, onReschedPlusMonth, onDelete }: {
  reminders: ReminderRowData[];
  onDraft: (r: ReminderRowData) => void;
  onMarkDone: (id: string) => void;
  onReschedToday: (id: string) => void;
  onReschedPlusMonth: (id: string, dueYmd: string) => void;
  onDelete: (id: string) => void;
}) {
  const todayYmd = ymd(new Date());

  const grouped = React.useMemo(() => {
    const map = new Map<string, ReminderRowData[]>();
    for (const r of reminders) {
      const k = r.dueAt;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce<{ month: string; days: Array<{ ymd: string; items: ReminderRowData[] }> }[]>((acc, [d, items]) => {
        const label = formatMonthLabel(d);
        const last = acc[acc.length - 1];
        if (!last || last.month !== label) acc.push({ month: label, days: [] });
        acc[acc.length - 1].days.push({ ymd: d, items });
        return acc;
      }, []);
  }, [reminders]);

  return (
    <div className="space-y-12">
      {grouped.map((group) => (
        <section key={group.month} className="space-y-8" aria-labelledby={`month-${group.month.replace(/\s+/g, '-')}`}>
          <h2 id={`month-${group.month.replace(/\s+/g, '-')}`} className="px-1 mt-12 mb-6 text-2xl md:text-3xl font-semibold text-slate-700">{group.month}</h2>
          {group.days.map(({ ymd, items }) => {
            const { dow, day } = formatDayParts(ymd);
            const isToday = ymd === todayYmd;
            return (
              <React.Fragment key={ymd}>
                {items.map((r) => (
                  <ReminderRow
                    key={r.id}
                    r={r}
                    isToday={isToday}
                    dow={dow}
                    day={day}
                    onDraft={onDraft}
                    onMarkDone={onMarkDone}
                    onReschedToday={onReschedToday}
                    onReschedPlusMonth={onReschedPlusMonth}
                    onDelete={onDelete}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </section>
      ))}
    </div>
  );
}
