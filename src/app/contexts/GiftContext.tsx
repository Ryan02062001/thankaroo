"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type GiftType = "physical" | "monetary" | "registry";

export type GiftItem = {
  id: string;
  guestName: string;
  description: string;
  type: GiftType;
  date: string;
  thankYouSent: boolean;
};

interface GiftContextType {
  gifts: GiftItem[];
  addGift: (gift: Omit<GiftItem, "id">) => void;
  deleteGift: (id: string) => void;
  toggleThankYou: (id: string) => void;
  exportAsCSV: () => void;
  updateGift: (id: string, updatedGift: Omit<GiftItem, "id">) => void;
}

const GiftContext = createContext<GiftContextType | undefined>(undefined);

export const GiftProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with an empty array so both server and client render the same markup
  const [gifts, setGifts] = useState<GiftItem[]>([]);

  // Load gifts from localStorage on client mount
  useEffect(() => {
    const saved = localStorage.getItem("thankarooGifts");
    if (saved) {
      setGifts(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever gifts change
  useEffect(() => {
    localStorage.setItem("thankarooGifts", JSON.stringify(gifts));
  }, [gifts]);

  const addGift = (gift: Omit<GiftItem, "id">) => {
    const newId = Math.random().toString(36).substring(2, 9);
    setGifts([...gifts, { ...gift, id: newId }]);
  };

  const deleteGift = (id: string) => {
    setGifts(gifts.filter((gift) => gift.id !== id));
  };

  const toggleThankYou = (id: string) => {
    setGifts(
      gifts.map((gift) =>
        gift.id === id ? { ...gift, thankYouSent: !gift.thankYouSent } : gift
      )
    );
  };

  // New updateGift function to allow editing an existing gift
  const updateGift = (id: string, updatedGift: Omit<GiftItem, "id">) => {
    setGifts(
      gifts.map((gift) =>
        gift.id === id ? { ...gift, ...updatedGift } : gift
      )
    );
  };

  const exportAsCSV = () => {
    const headers = [
      "Guest Name",
      "Gift Description",
      "Type",
      "Date Received",
      "Thank You Sent",
    ];
    const csvContent = [
      headers.join(","),
      ...gifts.map((gift) =>
        [
          "${gift.guestName}",
          "${gift.description}",
          gift.type,
          gift.date,
          gift.thankYouSent ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "thankaroo-gifts.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = { gifts, addGift, deleteGift, toggleThankYou, exportAsCSV, updateGift };

  return <GiftContext.Provider value={value}>{children}</GiftContext.Provider>;
};

export const useGifts = () => {
  const context = useContext(GiftContext);
  if (!context) {
    throw new Error("useGifts must be used within a GiftProvider");
  }
  return context;
};