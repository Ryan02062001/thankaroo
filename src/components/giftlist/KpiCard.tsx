import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  badge,
  badgeTone,
}: {
  label: string;
  value: number | string;
  badge?: string;
  badgeTone?: "success" | "warn" | "neutral";
}) {
  const badgeClass =
    badgeTone === "success"
      ? "border-[#3EB489]/40 bg-[#3EB489]/10 text-[#2f9c79]"
      : badgeTone === "warn"
      ? "border-amber-300/60 bg-amber-100/40 text-amber-800"
      : "border-gray-200 bg-gray-50 text-gray-600";

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6 md:p-7">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 text-4xl md:text-5xl font-semibold leading-none text-[#2d2d2d]">
              {value}
            </div>
          </div>
          {badge ? (
            <div className={`rounded-full border px-3 py-1 text-xs ${badgeClass}`}>{badge}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
