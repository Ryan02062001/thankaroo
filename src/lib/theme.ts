import type { Channel } from "@/app/contexts/ReminderContext";

// Centralized, brand‑aligned colors for reminder channels
export const channelBadgeClasses: Record<Channel, string> = {
  email: "bg-[#E6F0FF] text-[#1d3b6a] border-[#B7D0FF]",
  text: "bg-[#EAFBF3] text-[#1f4d3d] border-[#A8E6CF]",
  card: "bg-[#FFF2E0] text-[#5a3a1a] border-[#FFD8A8]",
};

export const channelBorderClasses: Record<Channel, string> = {
  email: "border-l-4 border-[#B7D0FF]",
  text: "border-l-4 border-[#A8E6CF]",
  card: "border-l-4 border-[#FFD8A8]",
};

export const channelPillButtonActive: Record<"all" | Channel, string> = {
  all: "bg-[#A8E6CF] text-[#1a1a1a] border-[#8ed0be]",
  email: "bg-[#E6F0FF] text-[#1d3b6a] border-[#B7D0FF]",
  text: "bg-[#EAFBF3] text-[#1f4d3d] border-[#A8E6CF]",
  card: "bg-[#FFF2E0] text-[#5a3a1a] border-[#FFD8A8]",
};


