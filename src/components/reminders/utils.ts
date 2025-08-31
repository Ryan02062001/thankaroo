export function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
