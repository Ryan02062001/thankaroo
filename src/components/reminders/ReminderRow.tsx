"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, Calendar as CalendarIcon, Trash2, ChevronDown, FileText } from "lucide-react";
import { channelBadgeClasses } from "@/lib/theme";

export type ReminderRowData = {
  id: string;
  listId: string;
  giftId: string;
  dueAt: string;
  sent: boolean;
  channel: "email" | "text" | "card";
  giftSnapshot: { guestName: string; description: string; date: string };
};

export default function ReminderRow({ r, isToday, dow, day, onDraft, onMarkDone, onReschedToday, onReschedPlusMonth, onDelete }: {
  r: ReminderRowData;
  isToday: boolean;
  dow: string;
  day: number;
  onDraft: (r: ReminderRowData) => void;
  onMarkDone: (id: string) => void;
  onReschedToday: (id: string) => void;
  onReschedPlusMonth: (id: string, dueYmd: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className={`rounded-xl border shadow-sm overflow-hidden ${r.sent ? "bg-[#EAFBF3] border-[#A8E6CF]" : "bg-white"}`} aria-label={`${r.giftSnapshot.guestName} reminder`}>
      <div className="grid grid-cols-[96px_1fr] lg:grid-cols-[112px_1fr_auto] items-center">
        <div className={`flex flex-col items-center justify-center border-r py-5 ${r.sent ? "bg-[#E0FFF4]" : "bg-slate-50/60"}`}>
          <div className={`text-sm font-medium ${r.sent ? "text-[#2d2d2d]" : "text-[#A8E6CF]"}`}>{dow}</div>
          <div className={`text-5xl font-semibold leading-none ${r.sent ? "text-[#2d2d2d]" : "text-[#A8E6CF]"}`}>{day}</div>
          {isToday && (
            <div className="mt-2 rounded-full bg-[#A8E6CF] px-3 py-1 text-[12px]">Today</div>
          )}
        </div>

        <div className="px-4 lg:px-5 py-5 min-w-0">
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

        <div className="px-4 lg:px-5 mt-4 lg:mt-0">
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
              <DropdownMenuItem onSelect={() => onDraft(r)}>
                <FileText className="h-4 w-4" /> Draft note
              </DropdownMenuItem>
              {!r.sent && (
                <DropdownMenuItem onSelect={() => onMarkDone(r.id)}>
                  <Check className="h-4 w-4" /> Mark done
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onReschedToday(r.id)}>
                <CalendarIcon className="h-4 w-4" /> Reschedule to today
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onReschedPlusMonth(r.id, r.dueAt)}>
                <CalendarIcon className="h-4 w-4" /> Reschedule +1 month
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(r.id)}>
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
