"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DashboardExportButtonProps {
  exportAsCSV: () => void;
}

export function DashboardExportButton({
  exportAsCSV,
}: DashboardExportButtonProps) {
  return (
    <div className="flex justify-center">
      <Button variant="outline" size="lg" onClick={exportAsCSV}>
        <Download className="mr-2 h-4 w-4 text-[#A4D9C9]" />
        Export Gift List
      </Button>
    </div>
  );
}
