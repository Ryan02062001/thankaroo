// src/app/contexts/GiftContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type GiftType = "non registry" | "monetary" | "registry" | "multiple";

export type GiftItem = {
  id: string;
  guestName: string;
  description: string;
  type: GiftType;
  date: string;
  thankYouSent: boolean;
};

export type GiftList = {
  id: string;
  name: string;
  gifts: GiftItem[];
};

interface GiftContextType {
  lists: GiftList[];
  currentListId: string;
  currentGifts: GiftItem[];
  gifts: GiftItem[];             // alias for currentGifts
  setCurrentList: (id: string) => void;
  createList: (name: string) => void;
  renameList: (id: string, newName: string) => void;
  addGift: (gift: Omit<GiftItem, "id">) => void;
  deleteGift: (id: string) => void;
  toggleThankYou: (id: string) => void;
  updateGift: (id: string, updatedGift: Omit<GiftItem, "id">) => void;
  exportAsCSV: () => void;
}

const GiftContext = createContext<GiftContextType | undefined>(undefined);

export const GiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [lists, setLists] = useState<GiftList[]>([]);
  const [currentListId, setCurrentListId] = useState<string>("");

  // load from storage or create default
  useEffect(() => {
    const saved = localStorage.getItem("thankarooGiftLists");
    if (saved) {
      try {
        const { lists: L, currentListId: C } = JSON.parse(saved);
        setLists(L);
        setCurrentListId(C);
        return;
      } catch {}
    }
    const defaultId = Math.random().toString(36).slice(2, 9);
    setLists([{ id: defaultId, name: "Default", gifts: [] }]);
    setCurrentListId(defaultId);
  }, []);

  // persist on change
  useEffect(() => {
    if (!currentListId) return;
    localStorage.setItem(
      "thankarooGiftLists",
      JSON.stringify({ lists, currentListId })
    );
  }, [lists, currentListId]);

  const updateCurrent = (fn: (L: GiftList) => GiftList) =>
    setLists(lists.map((l) => (l.id === currentListId ? fn(l) : l)));

  const createList = (name: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setLists([...lists, { id, name, gifts: [] }]);
    setCurrentListId(id);
  };

  const renameList = (id: string, newName: string) => {
    setLists(lists.map((l) => (l.id === id ? { ...l, name: newName } : l)));
  };

  const addGift = (gift: Omit<GiftItem, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    updateCurrent((l) => ({ ...l, gifts: [...l.gifts, { ...gift, id }] }));
  };

  const deleteGift = (id: string) =>
    updateCurrent((l) => ({ ...l, gifts: l.gifts.filter((g) => g.id !== id) }));

  const toggleThankYou = (id: string) =>
    updateCurrent((l) => ({
      ...l,
      gifts: l.gifts.map((g) =>
        g.id === id ? { ...g, thankYouSent: !g.thankYouSent } : g
      ),
    }));

  const updateGift = (id: string, upd: Omit<GiftItem, "id">) =>
    updateCurrent((l) => ({
      ...l,
      gifts: l.gifts.map((g) => (g.id === id ? { ...g, ...upd } : g)),
    }));

  const exportAsCSV = () => {
    const cur = lists.find((l) => l.id === currentListId);
    if (!cur) return;
    const headers = [
      "Guest Name",
      "Gift Description",
      "Type",
      "Date Received",
      "Thank You Sent",
    ];
    const rows = cur.gifts.map((g) => [
      g.guestName,
      g.description,
      g.type,
      g.date,
      g.thankYouSent ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cur.name}-gifts.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const current = lists.find((l) => l.id === currentListId)!;
  const currentGifts = current?.gifts || [];

  return (
    <GiftContext.Provider
      value={{
        lists,
        currentListId,
        currentGifts,
        gifts: currentGifts,
        setCurrentList: setCurrentListId,
        createList,
        renameList,
        addGift,
        deleteGift,
        toggleThankYou,
        updateGift,
        exportAsCSV,
      }}
    >
      {children}
    </GiftContext.Provider>
  );
};

export const useGifts = () => {
  const ctx = useContext(GiftContext);
  if (!ctx) throw new Error("useGifts must be used within GiftProvider");
  return ctx;
};

