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

type List = { id: string; name: string };

export function ListSelector({
  lists,
  currentListId,
}: {
  lists: List[];
  currentListId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  // UI state for dialogs
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);

  // Local inputs (uncontrolled would also work, but this keeps the button disabled state snappy)
  const [createName, setCreateName] = React.useState("");
  const [renameName, setRenameName] = React.useState(
    lists.find((l) => l.id === currentListId)?.name ?? ""
  );

  React.useEffect(() => {
    // Keep rename input in sync when list changes
    setRenameName(lists.find((l) => l.id === currentListId)?.name ?? "");
  }, [currentListId, lists]);

  const onChangeList = (id: string) => {
    const params = new URLSearchParams(search.toString());
    params.set("list", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasLists = lists.length > 0;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {/* Shadcn Select for a nicer dropdown */}
      <Select
        value={currentListId ?? ""}
        onValueChange={onChangeList}
        disabled={!hasLists}
      >
        <SelectTrigger className="w-64 text-[#2d2d2d]">
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

      {/* NEW LIST */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">New List</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#2d2d2d]">Create New List</DialogTitle>
            <DialogDescription className="text-[#2d2d2d]">
              Name your list and we’ll create it under your account.
            </DialogDescription>
          </DialogHeader>

          {/* Use a Server Action form so Supabase can set cookies + redirect */}
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
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]"
                disabled={!createName.trim()}
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* RENAME LIST */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!currentListId}>
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
                onClick={() => setIsRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]"
                disabled={!renameName.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
