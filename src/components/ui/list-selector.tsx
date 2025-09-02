// src/components/ui/list-selector.tsx
"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createList, renameList } from "@/app/actions/lists";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type List = { id: string; name: string };

export function ListSelector({
  lists,
  currentListId,
  className,
  onPrimaryWidth,
  children,
  mobileThreeCol = false,
}: {
  lists: List[];
  currentListId: string | null;
  className?: string;
  onPrimaryWidth?: (px: number) => void;
  children?: React.ReactNode;
  mobileThreeCol?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);

  const [createName, setCreateName] = React.useState("");
  const [renameName, setRenameName] = React.useState(
    lists.find((l) => l.id === currentListId)?.name ?? ""
  );

  React.useEffect(() => {
    setRenameName(lists.find((l) => l.id === currentListId)?.name ?? "");
  }, [currentListId, lists]);

  const onChangeList = (id: string) => {
    const params = new URLSearchParams(search.toString());
    params.set("list", id);
    router.push(`${pathname}?${params.toString()}`);
    try {
      document.cookie = `thankaroo_last_list_id=${encodeURIComponent(id)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
  };

  // Measure the width of the primary group: Select + New List + Rename
  const primaryRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!onPrimaryWidth) return;
    const el = primaryRef.current;
    if (!el) return;
    const report = () => onPrimaryWidth(el.getBoundingClientRect().width);
    report();
    const ro = new ResizeObserver(() => report());
    ro.observe(el);
    window.addEventListener("resize", report);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", report);
    };
  }, [onPrimaryWidth]);

  const hasLists = lists.length > 0;

  // Keep a cookie of the current list to preserve selection across pages/routes
  React.useEffect(() => {
    if (!currentListId) return;
    try {
      document.cookie = `thankaroo_last_list_id=${encodeURIComponent(currentListId)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
  }, [currentListId]);

  const topContainerClasses = "mb-6 flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap md:items-center gap-2 md:gap-3";

  const primaryGroupClasses = mobileThreeCol
    ? "grid grid-cols-3 items-stretch gap-2 md:flex md:flex-row md:flex-wrap lg:flex-nowrap md:items-center md:gap-3 w-full md:w-auto"
    : "flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap items-stretch md:items-center gap-2 md:gap-3 w-full md:w-auto";

  return (
    <div className={cn(topContainerClasses, className)}>
      <div ref={primaryRef} className={primaryGroupClasses}>
        <Select
          value={currentListId ?? ""}
          onValueChange={onChangeList}
          disabled={!hasLists}
        >
          <SelectTrigger size="lg" className="w-full sm:w-[176px] rounded-xl border-slate-200 bg-white text-slate-800">
            <SelectValue
              placeholder={hasLists ? "Select a list" : "No lists yet"}
            />
          </SelectTrigger>
          <SelectContent>
            {lists.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-12 w-full sm:w-[176px] rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              New List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-[#2d2d2d]">Create New List</DialogTitle>
              <DialogDescription className="text-[#2d2d2d]">
                Name your list and we’ll create it under your account.
              </DialogDescription>
            </DialogHeader>

            <form action={createList} className="space-y-4">
              <input type="hidden" name="redirect_to" value={pathname} />
              <div className="grid gap-2">
                <Label htmlFor="list_name" className="text-[#2d2d2d]">
                  List name
                </Label>
                <Input
                  id="list_name"
                  name="name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g., Wedding, Baby Shower"
                  required
                  className="text-[#2d2d2d]"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="rounded-md border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                  disabled={!createName.trim()}
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-12 w-full sm:w-[176px] rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
              disabled={!currentListId}
            >
              Rename
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-[#2d2d2d]">Rename List</DialogTitle>
              <DialogDescription className="text-[#2d2d2d]">
                Update the name of your selected list.
              </DialogDescription>
            </DialogHeader>

            <form action={renameList} className="space-y-4">
              <input type="hidden" name="id" value={currentListId ?? ""} />
              <input type="hidden" name="redirect_to" value={pathname} />
              <div className="grid gap-2">
                <Label htmlFor="rename_list_name" className="text-[#2d2d2d]">
                  New name
                </Label>
                <Input
                  id="rename_list_name"
                  name="name"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  required
                  className="text-[#2d2d2d]"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                  onClick={() => setIsRenameOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="rounded-md border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                  disabled={!renameName.trim()}
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {children}
    </div>
  );
}