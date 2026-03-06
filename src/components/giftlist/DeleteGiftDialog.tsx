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

export function DeleteGiftDialog({
  gift,
  isOpen,
  setIsOpen,
  onDeleted,
  guestMode,
  onDeleteGuest,
}: {
  gift: { id: string; guestName: string };
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDeleted: (id: string) => void;
  guestMode?: boolean;
  onDeleteGuest?: (id: string) => Promise<void> | void;
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (guestMode && onDeleteGuest) {
        await onDeleteGuest(gift.id);
      } else {
        await deleteGiftDirect({ id: gift.id });
      }

      onDeleted(gift.id);
      setIsOpen(false);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete this gift right now."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setDeleteError(null);
        }
      }}
    >
      <DialogContent
        className="
          p-0
          w-[min(calc(100vw-2rem),480px)]
          sm:max-w-[480px]
          rounded-2xl
          border
          bg-white
          shadow-2xl
          overflow-hidden
        "
      >
        {/* Accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-300 via-rose-400 to-red-400" />

        {/* Layout: scrollable body + sticky footer so actions never overflow */}
        <div className="flex max-h-[85vh] flex-col">
          {/* BODY */}
          <div className="px-5 py-6 sm:px-7 sm:py-7 overflow-y-auto">
            <DialogHeader className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                <Trash2 className="h-3.5 w-3.5" />
                Delete gift
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-bold text-[#1f2937]">
                Are you sure?
              </DialogTitle>

              <DialogDescription className="text-[15px] leading-relaxed text-gray-600">
                You’re about to delete the gift from{" "}
                <strong className="text-gray-900">{gift.guestName}</strong>. This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            {deleteError ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </div>
            ) : null}
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <div className="px-5 py-4 sm:px-7 sm:py-5">
              <DialogFooter className="m-0 p-0 gap-2 flex flex-col sm:flex-row w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="h-11 w-full sm:w-6/12 rounded-xl"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  className="
                    h-11 w-full sm:w-6/12 rounded-xl
                    bg-red-600 hover:bg-red-700 text-white
                    focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2
                  "
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete Gift"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
