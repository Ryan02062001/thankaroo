import { Button } from "@/components/ui/button";

export default function Header({ onOpenAdd, onOpenSettings, onExport }: { onOpenAdd: () => void; onOpenSettings: () => void; onExport: () => void }) {
  return (
    <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold text-[#2d2d2d]">Reminders</h1>
        <p className="mt-1 text-sm text-[#2d2d2d]/70">Plan, reschedule, and complete your thank‑you reminders.</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          className="rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          onClick={onOpenAdd}
        >
          Add Reminder
        </Button>
        <Button
          variant="outline"
          className="rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          onClick={onOpenSettings}
        >
          Settings
        </Button>
        <Button
          variant="outline"
          className="rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          onClick={onExport}
        >
          Export
        </Button>
      </div>
    </header>
  );
}
