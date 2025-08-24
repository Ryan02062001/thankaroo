"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";

type StatusValue = "all" | "draft" | "sent";
type ChannelValue = "all" | "email" | "text" | "card";

export function NotesFilters({
  listId,
  initialQuery,
  initialStatus,
  initialChannel,
}: {
  listId: string;
  initialQuery: string;
  initialStatus: StatusValue;
  initialChannel: ChannelValue;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState<string>(initialQuery);
  const [status, setStatus] = useState<StatusValue>(initialStatus);
  const [channel, setChannel] = useState<ChannelValue>(initialChannel);

  const buildUrl = useCallback(
    (next: { q?: string; status?: StatusValue; channel?: ChannelValue }) => {
      const params = new URLSearchParams(searchParams?.toString());
      // Ensure list stays in the URL
      params.set("list", listId);

      // Query
      if (next.q !== undefined) {
        const trimmed = (next.q || "").trim();
        if (trimmed) params.set("q", trimmed);
        else params.delete("q");
      }

      // Status
      if (next.status !== undefined) {
        if (next.status && next.status !== "all") params.set("status", next.status);
        else params.delete("status");
      }

      // Channel
      if (next.channel !== undefined) {
        if (next.channel && next.channel !== "all") params.set("channel", next.channel);
        else params.delete("channel");
      }

      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams, listId]
  );

  // Debounce query updates
  useEffect(() => {
    const handle = setTimeout(() => {
      router.push(buildUrl({ q: query }));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, router, buildUrl]);

  const onStatusChange = useCallback(
    (value: StatusValue) => {
      setStatus(value);
      router.push(buildUrl({ status: value }));
    },
    [router, buildUrl]
  );

  const onChannelChange = useCallback(
    (value: ChannelValue) => {
      setChannel(value);
      router.push(buildUrl({ channel: value }));
    },
    [router, buildUrl]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search content or person…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Filter className="h-4 w-4" />
        <span>Filter</span>
      </div>
      <Select value={status} onValueChange={(v) => onStatusChange(v as StatusValue)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="draft">Drafts</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
        </SelectContent>
      </Select>
      <Select value={channel} onValueChange={(v) => onChannelChange(v as ChannelValue)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Channel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="text">Text</SelectItem>
          <SelectItem value="card">Card</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}


