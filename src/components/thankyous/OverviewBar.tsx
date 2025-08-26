"use client";
export function OverviewBar({ sent, total, pending }: { sent: number; total: number; pending: number }) {
  return (
    <>
      <div className="flex items-center justify-between text-sm text-[#2d2d2d] mb-2">
        <div className="font-semibold">Progress</div>
        <div className="text-gray-600">{sent}/{total} sent • {pending} pending</div>
      </div>
      <div className="text-xs sm:text-sm text-gray-600">Focusing on pending helps you finish faster.</div>
    </>
  );
}
