"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { PeopleFilters } from "./PeopleFilters";
import { PeopleSelect } from "./PeopleSelect";
import { PeopleList } from "./PeopleList";
import type { StatusFilter } from "./types";

export function PeoplePanel(props: {
  // counts per PERSON
  pendingPeopleCount: number;
  sentPeopleCount: number;

  statusFilter: StatusFilter;
  setStatusFilter: (s: StatusFilter) => void;

  query: string;
  setQuery: (q: string) => void;

  // filtered list of names to show given current tab + search
  filteredPersonList: string[];
  selectedPerson: string | null;
  onSelectPerson: (p: string) => void;

  // summary for progress bar
  personSummary: Map<string, { total: number; sent: number; pending: number }>;
}) {
  return (
    <Card className="bg-white/80 border border-gray-200/60 shadow-sm backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-[#2d2d2d]">
          <Users className="h-5 w-5 text-[#A8E6CF]" />
          <span>People</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PeopleFilters
          pendingCount={props.pendingPeopleCount}
          sentCount={props.sentPeopleCount}
          statusFilter={props.statusFilter}
          setStatusFilter={props.setStatusFilter}
          query={props.query}
          setQuery={props.setQuery}
        />

        <PeopleSelect
          personList={props.filteredPersonList}
          selectedPerson={props.selectedPerson}
          onSelectPerson={props.onSelectPerson}
        />

        <div className="hidden lg:block">
          <PeopleList
            personList={props.filteredPersonList}
            selectedPerson={props.selectedPerson}
            onSelectPerson={props.onSelectPerson}
            personSummary={props.personSummary}
          />
        </div>
      </CardContent>
    </Card>
  );
}
