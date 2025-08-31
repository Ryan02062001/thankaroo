import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function CompletionCard({ thanked, total, progress }: { thanked: number; total: number; progress: number }) {
  return (
    <Card className="rounded-3xl border-gray-200 shadow-sm">
      <CardContent className="p-6 md:p-7">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xl font-bold text-[#2d2d2d]">Thank‑You Completion</span>
          <span className="inline-flex items-center rounded-full border border-[#A8E6CF] bg-[#A8E6CF]/20 px-2.5 py-1 text-xs font-medium text-[#2f9c79]">
            {thanked} of {total}
          </span>
        </div>
        <div className="relative">
          <Progress
            value={progress}
            className="h-4 bg-[#A8E6CF]/40 [&>div]:bg-[linear-gradient(to_right,#2f9c79,#3EB489)] [&>div]:shadow-sm"
            aria-label="Overall thank you progress"
          />
          <div className="mt-2 text-xs text-[#2d2d2d]/70">{progress}% completed</div>
        </div>
      </CardContent>
    </Card>
  );
}
