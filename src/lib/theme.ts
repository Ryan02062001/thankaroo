import type { Channel } from "@/app/contexts/ReminderContext";

// Centralized, brand‑aligned colors for reminder channels
export const channelBadgeClasses: Record<Channel, string> = {
  email: "bg-[#E6F0FF] text-[#1d3b6a] border-[#B7D0FF]",
  text: "bg-[#EAFBF3] text-[#1f4d3d] border-[#A8E6CF]",
  card: "bg-[#FFF2E0] text-[#5a3a1a] border-[#FFD8A8]",
};

