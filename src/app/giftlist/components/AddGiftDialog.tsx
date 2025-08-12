"use client";

import * as React from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { createGift } from "@/app/actions/gifts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { usePathname } from "next/navigation";

type GiftType = "non registry" | "monetary" | "registry" | "multiple";

export function AddGiftDialog({
  listId,
  isOpen,
  setIsOpen,
}: {
  listId: string;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [type, setType] = React.useState<GiftType>("non registry");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

        <form action={createGift}>
          <input type="hidden" name="list_id" value={listId} />
          <input type="hidden" name="redirect_to" value={pathname} />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="guest_name" className="text-[#2d2d2d]">Guest Name</Label>
              <Input id="guest_name" name="guest_name" required className="text-[#2d2d2d]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-[#2d2d2d]">Gift Description</Label>
              <Input id="description" name="description" required className="text-[#2d2d2d]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gift_type" className="text-[#2d2d2d]">Gift Type</Label>
                <Select value={type} onValueChange={(v: GiftType) => setType(v)}>
                  <SelectTrigger id="gift_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non registry">Non Registry Gift</SelectItem>
                    <SelectItem value="monetary">Monetary Gift</SelectItem>
                    <SelectItem value="registry">Registry Gift</SelectItem>
                    <SelectItem value="multiple">Multiple Gifts</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="gift_type" value={type} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date_received" className="text-[#2d2d2d]">Date Received</Label>
                <Input
                  id="date_received"
                  name="date_received"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="text-[#2d2d2d]"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button className="bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]">Add Gift</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
