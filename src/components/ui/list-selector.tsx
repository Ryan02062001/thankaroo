// src/components/ListSelector.tsx
"use client";

import { useState } from "react";
import { useGifts } from "@/app/contexts/GiftContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function ListSelector() {
  const {
    lists,
    currentListId,
    setCurrentList,
    createList,
    renameList,
  } = useGifts();

  const [newName, setNewName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  // prefill rename dialog with the current list’s name
  const current = lists.find((l) => l.id === currentListId);
  const [renameInput, setRenameInput] = useState(current?.name || "");

  return (
    <div className="flex items-center gap-2 mb-4">
      <Select value={currentListId} onValueChange={(v) => setCurrentList(v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select list…" />
        </SelectTrigger>
        <SelectContent>
          {lists.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button size="sm" variant="outline" onClick={() => setIsCreateOpen(true)}>
        New List
      </Button>
      <Button size="sm" variant="outline" onClick={() => {
        setRenameInput(current?.name || "");
        setIsRenameOpen(true);
      }}>
        Rename
      </Button>

      {/* Create */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="List name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                createList(newName.trim());
                setNewName("");
                setIsCreateOpen(false);
              }}
              disabled={!newName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename List</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="New name"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                renameList(currentListId, renameInput.trim());
                setIsRenameOpen(false);
              }}
              disabled={!renameInput.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

