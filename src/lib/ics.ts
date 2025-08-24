// Lightweight ICS file generator for reminders
// Produces a string suitable for download as text/calendar

export type IcsReminderEvent = {
  id: string;
  title: string;
  description?: string;
  dateYmd: string; // YYYY-MM-DD (treated as all-day)
};

function formatDateYmdToIcs(dateYmd: string): string {
  // All-day event in local time as YYYYMMDD (no time component)
  return dateYmd.replaceAll("-", "");
}

function escape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function generateIcs(reminders: IcsReminderEvent[], calendarName = "Thankaroo Reminders"): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//Thankaroo//Reminders//EN");
  lines.push(`X-WR-CALNAME:${escape(calendarName)}`);

  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");

  for (const r of reminders) {
    const dt = formatDateYmdToIcs(r.dateYmd);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${escape(r.id)}@thankaroo`);
    lines.push(`DTSTAMP:${now}`);
    // All-day event uses DTSTART/DTEND with VALUE=DATE; DTEND is non-inclusive next day
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    // Compute next day YYYYMMDD quickly
    const d = new Date(r.dateYmd + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    const nextYmd = d.toISOString().slice(0, 10).replaceAll("-", "");
    lines.push(`DTEND;VALUE=DATE:${nextYmd}`);
    lines.push(`SUMMARY:${escape(r.title)}`);
    if (r.description) lines.push(`DESCRIPTION:${escape(r.description)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}


