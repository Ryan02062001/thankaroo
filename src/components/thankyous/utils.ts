import { Mail, MessageSquare, Scroll } from "lucide-react";
import type { Channel } from "@/app/contexts/ReminderContext";

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function appendMeta(base: string, personal: string, occ: string) {
  let extra = "";
  if (personal?.trim()) extra += `\n\nP.S. ${personal.trim()}`;
  if (occ && occ !== "general") extra += `\n\n(Occasion: ${capitalize(occ)})`;
  return (base + extra).trim();
}

export const buildMailtoUrl = (subject: string, body: string) =>
  `mailto:?subject=${encodeURIComponent(subject || "Thank you!")}&body=${encodeURIComponent(body || "")}`;

export const buildSmsUrl = (body: string) => `sms:&body=${encodeURIComponent(body || "")}`;

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

export const getChannelIcon = (ch: Channel) => (ch === "email" ? Mail : ch === "text" ? MessageSquare : Scroll);
