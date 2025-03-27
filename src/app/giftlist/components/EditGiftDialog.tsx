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

interface EditGiftDialogProps {
  gift: GiftItem;
  setGift: (gift: GiftItem) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleUpdateGift: () => void;
}

export function EditGiftDialog({
  gift,
  setGift,
  isOpen,
  setIsOpen,
  handleUpdateGift,
}: EditGiftDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span style={{ display: "none" }} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#2d2d2d]">Edit Gift</DialogTitle>
          <DialogDescription className="text-[#2d2d2d]">
            Update the details of the gift.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="guestName" className="text-[#2d2d2d]">
              Guest Name
            </Label>
            <Input
              id="guestName"
              value={gift.guestName}
              onChange={(e) =>
                setGift({ ...gift, guestName: e.target.value })
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
              value={gift.description}
              onChange={(e) =>
                setGift({ ...gift, description: e.target.value })
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
                value={gift.type}
                onValueChange={(value: GiftType) =>
                  setGift({ ...gift, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" className="text-[#2d2d2d]" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non registry">Non Registry Gift</SelectItem>
                  <SelectItem value="monetary">Monetary Gift</SelectItem>
                  <SelectItem value="registry">Registry Gift</SelectItem>
                  <SelectItem value="multiple">Multiple Gifts</SelectItem>
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
                value={gift.date}
                onChange={(e) =>
                  setGift({ ...gift, date: e.target.value })
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
            onClick={handleUpdateGift}
            className="bg-[#A8E6CF] hover:bg-[#98CFBA] text-[#2d2d2d]"
            disabled={!gift.guestName || !gift.description}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
