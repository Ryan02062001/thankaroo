"use client";

import { useRef } from "react";
import Papa from "papaparse";
import { useGifts, GiftItem, GiftType } from "@/app/contexts/GiftContext";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

const parseYes = (v: unknown) => /^(y|yes|true|1)$/i.test(String(v ?? "").trim());
const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

export function DashboardExportButton() {
  const { exportAsCSV, importGifts } = useGifts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const items: Omit<GiftItem, "id">[] = results.data.map((row) => {
          const G = (row["Guest Name"] ?? "").trim();
          const D = (row["Gift Description"] ?? "").trim();
          const rawType = (row["Type"] ?? "").trim().toLowerCase();
          const T = (rawType as GiftType) || "non registry";
          const Dt = (row["Date Received"] ?? "").trim();
          const Y = parseYes(row["Thank You Sent"]);

          const type: GiftType = ["non registry", "monetary", "registry", "multiple"].includes(T)
            ? T
            : "non registry";

          const date = isISODate(Dt) ? Dt : new Date().toISOString().split("T")[0];

          return { guestName: G, description: D, type, date, thankYouSent: Y };
        });
        importGifts(items);
      },
    });

    // reset to allow re-uploading the same file
    e.target.value = "";
  };

  return (
    <div className="flex justify-center space-x-4">
      <input
        type="file"
        accept=".csv"
        hidden
        ref={fileInputRef}
        onChange={handleFile}
      />
      <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4 text-[#A4D9C9]" />
        Import Gift List
      </Button>
      <Button variant="outline" size="lg" onClick={exportAsCSV}>
        <Download className="mr-2 h-4 w-4 text-[#A4D9C9]" />
        Export Gift List
      </Button>
    </div>
  );
}
