"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GiftType, GiftItem } from "@/app/contexts/GiftContext";

interface AddGiftDialogProps {
  newGift: Omit<GiftItem, "id">;
  setNewGift: (gift: Omit<GiftItem, "id">) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleAddGift: () => void;
}

export function AddGiftDialog({
  newGift,
  setNewGift,
  isOpen,
  setIsOpen,
  handleAddGift,
}: AddGiftDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Instead of an empty fragment, we use an empty span */}
      <DialogTrigger asChild>
        <span style={{ display: "none" }} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#2d2d2d]">Add New Gift</DialogTitle>
          <DialogDescription className="text-[#2d2d2d]">
            Enter the details of the gift you received.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="guestName" className="text-[#2d2d2d]">
              Guest Name
            </Label>
            <Input
              id="guestName"
              value={newGift.guestName}
              onChange={(e) =>
                setNewGift({ ...newGift, guestName: e.target.value })
              }
              placeholder="e.g. John & Jane Smith"
              className="text-[#2d2d2d]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-[#2d2d2d]">
              Gift Description
            </Label>
            <Input
              id="description"
              value={newGift.description}
              onChange={(e) =>
                setNewGift({ ...newGift, description: e.target.value })
              }
              placeholder="e.g. Crystal vase"
              className="text-[#2d2d2d]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-[#2d2d2d]">
                Gift Type
              </Label>
              <Select
                value={newGift.type}
                onValueChange={(value: GiftType) =>
                  setNewGift({ ...newGift, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" className="text-[#2d2d2d]" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical Gift</SelectItem>
                  <SelectItem value="monetary">Monetary Gift</SelectItem>
                  <SelectItem value="registry">Registry Gift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-[#2d2d2d]">
                Date Received
              </Label>
              <Input
                id="date"
                type="date"
                value={newGift.date}
                onChange={(e) =>
                  setNewGift({ ...newGift, date: e.target.value })
                }
                className="text-[#2d2d2d]"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddGift}
            className="bg-[#A8E6CF] hover:bg-[#98CFBA] text-[#2d2d2d]"
            disabled={!newGift.guestName || !newGift.description}
          >
            Add Gift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

