export type UIGift = {
  id: string;
  guestName: string;
  description: string;
  type: "non registry" | "monetary" | "registry" | "multiple";
  date: string; // YYYY-MM-DD
  thankYouSent: boolean;
};

export type ImportGiftItem = {
  guestName: string;
  description: string;
  type: UIGift["type"];
  date: string; // YYYY-MM-DD
  thankYouSent: boolean;
};
