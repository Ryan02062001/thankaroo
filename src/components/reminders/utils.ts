import { toYmd } from "@/lib/date";

export function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function ymd(d: Date) {
  return toYmd(d);
}
