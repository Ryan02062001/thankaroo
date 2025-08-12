"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type GiftType = "non registry" | "monetary" | "registry" | "multiple";

export type GiftItem = {
  id: string;
  guestName: string;
  description: string;
  type: GiftType;
  date: string; // YYYY-MM-DD
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
  gifts: GiftItem[];
  setCurrentList: (id: string) => void;
  createList: (name: string) => void;
  renameList: (id: string, newName: string) => void;
  importGifts: (items: Omit<GiftItem, "id">[]) => void;
  addGift: (gift: Omit<GiftItem, "id">) => void;
  deleteGift: (id: string) => void;
  toggleThankYou: (id: string) => void;
  updateGift: (id: string, updated: Omit<GiftItem, "id">) => void;
  exportAsCSV: () => void;
}

const STORAGE_KEY = "thankarooGiftLists";

const GiftContext = createContext<GiftContextType | undefined>(undefined);

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

const sanitizeFilename = (name: string) =>
  name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").slice(0, 80);

export const GiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [lists, setLists] = useState<GiftList[]>([]);
  const [currentListId, setCurrentListId] = useState<string>("");

  // Load or initialize
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          lists: GiftList[];
          currentListId: string;
        };

        if (Array.isArray(parsed?.lists) && parsed.lists.length > 0) {
          setLists(parsed.lists);
          const exists = parsed.lists.some((l) => l.id === parsed.currentListId);
          setCurrentListId(exists ? parsed.currentListId : parsed.lists[0].id);
          return;
        }
      }
    } catch {
      // ignore corrupted storage and fall through to init
    }

    const defaultId = genId();
    setLists([{ id: defaultId, name: "Default", gifts: [] }]);
    setCurrentListId(defaultId);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!currentListId) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lists, currentListId })
      );
    } catch {
      // storage may be full or blocked; ignore
    }
  }, [lists, currentListId]);

  // Helpers
  const updateCurrent = (fn: (l: GiftList) => GiftList) =>
    setLists((prev) =>
      prev.map((l) => (l.id === currentListId ? fn(l) : l))
    );

  // List management
  const createList = (name: string) => {
    const id = genId();
    setLists((prev) => [...prev, { id, name, gifts: [] }]);
    setCurrentListId(id);
  };

  const renameList = (id: string, newName: string) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name: newName } : l)));
  };

  const importGifts = (items: Omit<GiftItem, "id">[]) => {
    const withIds: GiftItem[] = items.map((g) => ({ ...g, id: genId() }));
    updateCurrent((l) => ({ ...l, gifts: [...l.gifts, ...withIds] }));
  };

  // Gift CRUD
  const addGift = (gift: Omit<GiftItem, "id">) => {
    const id = genId();
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

  const updateGift = (id: string, updated: Omit<GiftItem, "id">) =>
    updateCurrent((l) => ({
      ...l,
      gifts: l.gifts.map((g) => (g.id === id ? { ...g, ...updated } : g)),
    }));

  // CSV quoting (wrap in quotes and escape inner quotes by doubling)
  const quote = (val: string) => {
    const escaped = (val ?? "").replace(/"/g, '""');
    return `"${escaped}"`;
  };

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

    const rows = cur.gifts.map((g) => {
      const values = [
        g.guestName || "N/A",
        g.description || "N/A",
        g.type || "N/A",
        g.date || "N/A",
        g.thankYouSent ? "Yes" : "No",
      ];
      return values.map(quote).join(",");
    });

    const csvContent = [headers.map(quote).join(","), ...rows].join("\r\n");

    // Prepend BOM for Excel compatibility
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(cur.name)}-gifts.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Avoid URL leaks
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const currentGifts = useMemo(
    () => lists.find((l) => l.id === currentListId)?.gifts ?? [],
    [lists, currentListId]
  );

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
        importGifts,
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