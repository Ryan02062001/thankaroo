"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteGiftDirect } from "@/app/actions/gifts";
import { usePathname } from "next/navigation";

export function DeleteGiftDialog({
  listId,
  gift,
  isOpen,
  setIsOpen,
  onDeleted,
}: {
  listId: string;
  gift: { id: string; guestName: string };
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDeleted: (id: string) => void;
}) {
  const pathname = usePathname();

  const handleDelete = async (formData: FormData) => {
    formData.append("id", gift.id);
    formData.append("list_id", listId);
    formData.append("next", pathname);
    await deleteGiftDirect({ id: gift.id });
    onDeleted(gift.id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#2d2d2d] flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Gift
          </DialogTitle>
          <DialogDescription className="text-[#2d2d2d]">
            Are you sure you want to delete the gift from <strong>{gift.guestName}</strong>? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <form action={handleDelete} className="flex-1 sm:flex-none">
            <Button
              type="submit"
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Gift
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
