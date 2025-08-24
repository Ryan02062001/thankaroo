import type { Channel, Relationship, Tone } from "@/app/contexts/ReminderContext";

type GiftMeta = {
  guestName: string;
  description: string;
};

export function generateDraft(params: {
  channel: Channel;
  gift: GiftMeta;
  relationship: Relationship;
  tone: Tone;
}) {
  const { channel, gift, relationship, tone } = params;
  const greeting =
    relationship === "family"
      ? `Dear ${gift.guestName},`
      : relationship === "coworker"
      ? `Hi ${gift.guestName},`
      : `Hello ${gift.guestName},`;

  const toneLine =
    tone === "formal"
      ? "I wanted to express my sincere gratitude for your thoughtful gift."
      : tone === "playful"
      ? "You absolutely made my day with your awesome gift!"
      : "Thank you so much for your thoughtful gift.";

  const body = `I truly appreciate the ${gift.description.toLowerCase()}. It means a lot and will be put to good use.`;
  const closer =
    tone === "formal"
      ? "With appreciation,"
      : tone === "playful"
      ? "With big thanks,"
      : "Warmly,";

  const signature = "— Me";

  const content = `${greeting}

${toneLine} ${body}

${closer}
${signature}`;

  if (channel === "text") {
    return content
      .replace(/\n{2,}/g, "\n")
      .replace(/\n/g, " ")
      .trim();
  }
  return content;
}
