"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AdvancedOptions({
  occasion, setOccasion,
  personalTouch, setPersonalTouch,
}: {
  occasion: string; setOccasion: (o: string) => void;
  personalTouch: string; setPersonalTouch: (p: string) => void;
}) {
  return (
    <div className="p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="text-sm font-medium text-[#2d2d2d] mb-2 block">Occasion</label>
          <Select value={occasion} onValueChange={setOccasion}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-[#2d2d2d] mb-2 block">
            Personal touch <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <Textarea
            value={personalTouch}
            onChange={(e) => setPersonalTouch(e.target.value)}
            placeholder="Add specific memories, inside jokes, or personal details..."
            className="min-h-[80px] resize-y"
          />
        </div>
      </div>
    </div>
  );
}
