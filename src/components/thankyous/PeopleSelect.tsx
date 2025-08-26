"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PeopleSelect({
  personList,
  selectedPerson,
  onSelectPerson,
}: {
  personList: string[];
  selectedPerson: string | null;
  onSelectPerson: (p: string) => void;
}) {
  return (
    <div className="lg:hidden">
      <label className="text-sm font-medium text-[#2d2d2d] mb-2 block">From whom?</label>
      <Select value={selectedPerson ?? undefined} onValueChange={(v) => onSelectPerson(v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a person..." />
        </SelectTrigger>
        <SelectContent>
          {personList.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
