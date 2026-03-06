const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toYmd(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayYmd(now: Date = new Date()) {
  return toYmd(now);
}

export function isYmd(value: string | null | undefined): value is string {
  return DATE_ONLY_PATTERN.test(value ?? "");
}

export function normalizeYmd(value: string | null | undefined, fallback = todayYmd()) {
  const trimmed = String(value ?? "").trim();
  const candidate = trimmed.slice(0, 10);
  return isYmd(candidate) ? candidate : fallback;
}

export function parseYmd(value: string | null | undefined, fallback = todayYmd()) {
  const normalized = normalizeYmd(value, fallback);
  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function addDaysToYmd(value: string, days: number) {
  const next = parseYmd(value);
  next.setDate(next.getDate() + days);
  return toYmd(next);
}

export function formatYmd(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
  locale = "en-US"
) {
  return new Intl.DateTimeFormat(locale, options).format(parseYmd(value));
}
