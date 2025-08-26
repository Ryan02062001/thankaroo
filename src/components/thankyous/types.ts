import type { Channel, Relationship, Tone } from "@/app/contexts/ReminderContext";

export type UIGift = {
  id: string;
  guestName: string;
  description: string;
  type: "non registry" | "monetary" | "registry" | "multiple";
  date: string; // YYYY-MM-DD
  thankYouSent: boolean;
};

export type StatusFilter = "pending" | "sent"; // ✅ no "all"

export type Note = {
  id: string;
  gift_id: string;
  channel: Channel;
  relationship: Relationship;
  tone: Tone;
  status: "draft" | "sent";
  content: string;
  meta: { occasion?: string | null; personalTouch?: string | null } | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
};
