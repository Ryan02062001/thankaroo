"use client";
import { AvatarCircle } from "./AvatarCircle";

export function PeopleList({
  personList,
  selectedPerson,
  onSelectPerson,
  personSummary,
}: {
  personList: string[];
  selectedPerson: string | null;
  onSelectPerson: (p: string) => void;
  personSummary: Map<string, { total: number; sent: number; pending: number }>;
}) {
  return (
    <div className="hidden lg:block">
      <ul className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
        {personList.map((p) => {
          const s = personSummary.get(p)!;
          const active = p === selectedPerson;
          const pct = s.total ? Math.round((s.sent / s.total) * 100) : 0;
          return (
            <li key={p}>
              <button
                type="button"
                onClick={() => onSelectPerson(p)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  active ? "border-[#A8E6CF] bg-[#A8E6CF]/10 shadow-sm"
                         : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AvatarCircle name={p} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-[#2d2d2d] truncate">{p}</div>
                      <div className="text-xs text-gray-600 whitespace-nowrap">{s.sent}/{s.total} sent</div>
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full bg-gradient-to-r from-[#A8E6CF] to-[#98CFBA]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
