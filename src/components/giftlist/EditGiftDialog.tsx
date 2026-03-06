// path: /components/giftlist/EditGiftDialog.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateGiftDirect } from "@/app/actions/gifts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Gift as GiftIcon,
  DollarSign,
  Package,
  Boxes,
  CalendarDays,
  BadgeCheck
} from "lucide-react";
import type { UIGift } from "@/components/giftlist/types";
import { todayYmd } from "@/lib/date";

export function EditGiftDialog({
  gift,
  isOpen,
  setIsOpen,
  onUpdated,
  guestMode,
  updateGuestGift,
}: {
  gift: UIGift;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onUpdated: (gift: UIGift) => void;
  guestMode?: boolean;
  updateGuestGift?: (input: {
    id: string;
    guestName: string;
    description: string;
    giftType: UIGift["type"];
    dateReceived?: string | null;
    thankYouSent?: boolean;
  }) => Promise<UIGift>;
}) {
  // Local state mirrors the current `gift` prop
  const [guest, setGuest] = React.useState(gift.guestName);
  const [desc, setDesc] = React.useState(gift.description);
  const [type, setType] = React.useState<UIGift["type"]>(gift.type);
  const [date, setDate] = React.useState(gift.date);
  const [thank, setThank] = React.useState(gift.thankYouSent);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{ guest?: string; desc?: string }>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const today = todayYmd();

  // --- FIX: Ensure dialog fields always reflect the *currently selected* gift.
  // Reinitialize local state whenever the dialog opens for a gift, or when the gift changes.
  const initFromGift = React.useCallback(() => {
    setGuest(gift.guestName);
    setDesc(gift.description);
    setType(gift.type);
    setDate(gift.date);
    setThank(gift.thankYouSent);
    setErrors({});
    setSubmitError(null);
  }, [gift]);

  React.useEffect(() => {
    if (isOpen) {
      initFromGift();
    }
  }, [isOpen, initFromGift, gift.id]);

  const validate = React.useCallback(() => {
    const next: typeof errors = {};
    if (!guest.trim()) next.guest = "Please enter the guest’s name.";
    if (!desc.trim()) next.desc = "Please describe the gift.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [desc, guest]);

  const TypeTile = ({
    value,
    label,
    icon: Icon,
  }: {
    value: UIGift["type"];
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }) => {
    const active = type === value;
    return (
      <button
        type="button"
        onClick={() => setType(value)}
        role="radio"
        aria-checked={active}
        className={[
          "flex items-center gap-2 rounded-xl border p-3 text-left transition-all",
          "w-full min-h-[88px] h-full",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8E6CF] focus-visible:ring-offset-2",
          active
            ? "border-[#A8E6CF] bg-[#A8E6CF]/10 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
        ].join(" ")}
      >
        <span
          className={[
            "hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg",
            active ? "bg-[#A8E6CF]/30" : "bg-gray-50",
          ].join(" ")}
          aria-hidden
        >
          <Icon className="h-4 w-4 text-gray-700" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-medium text-gray-900">{label}</span>
          {value === "non registry" ? (
            <span className="block text-xs text-gray-500">Not from the registry</span>
          ) : value === "monetary" ? (
            <span className="block text-xs text-gray-500">Cash, check, gift card</span>
          ) : value === "registry" ? (
            <span className="block text-xs text-gray-500">From your registry</span>
          ) : (
            <span className="block text-xs text-gray-500">Group of items</span>
          )}
        </span>
      </button>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setIsSubmitting(false);
          setSubmitError(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-[520px] p-0">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#A8E6CF] via-[#98CFBA] to-[#8cc4b0]" />

        <div className="p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1f2937]">Edit Gift</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update details and status. Changes are saved to this list.
            </DialogDescription>
          </DialogHeader>

          <form
            className="mt-4 space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (isSubmitting || !validate()) return;
              setIsSubmitting(true);
              setSubmitError(null);
              try {
                if (guestMode && updateGuestGift) {
                  const updated = await updateGuestGift({
                    id: gift.id,
                    guestName: guest.trim(),
                    description: desc.trim(),
                    giftType: type,
                    dateReceived: date,
                    thankYouSent: thank,
                  });
                  onUpdated(updated);
                  setIsOpen(false);
                } else {
                  const updated = await updateGiftDirect({
                    id: gift.id,
                    guestName: guest.trim(),
                    description: desc.trim(),
                    giftType: type,
                    dateReceived: date,
                    thankYouSent: thank,
                  });
                  onUpdated(updated as UIGift);
                  setIsOpen(false);
                }
              } catch (error) {
                setSubmitError(
                  error instanceof Error ? error.message : "Unable to update this gift right now."
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="guest_name">Guest name</Label>
              <Input
                id="guest_name"
                name="guest_name"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                aria-invalid={!!errors.guest}
                aria-describedby={errors.guest ? "edit_guest_name_error" : undefined}
                placeholder="e.g., Alex Johnson"
              />
              {errors.guest ? (
                <p id="edit_guest_name_error" className="text-xs text-red-600">{errors.guest}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_received" className="text-sm">Date received</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                <Input
                  id="date_received"
                  name="date_received"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={today}
                  className="pl-8 text-sm h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Gift description</Label>
              <Textarea
                id="description"
                name="description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                aria-invalid={!!errors.desc}
                aria-describedby={errors.desc ? "edit_desc_error" : undefined}
                className="min-h-[88px] resize-y"
                maxLength={500}
              />
              {errors.desc ? (
                <p id="edit_desc_error" className="text-xs text-red-600">{errors.desc}</p>
              ) : null}
              <div className="text-xs text-gray-500 flex justify-end">{desc.length}/500</div>
            </div>

            <div className="space-y-2">
              <Label>Gift type</Label>
              <div role="radiogroup" className="grid grid-cols-2 gap-2">
                <TypeTile value="non registry" label="Non-registry" icon={Package} />
                <TypeTile value="monetary" label="Monetary" icon={DollarSign} />
                <TypeTile value="registry" label="Registry" icon={GiftIcon} />
                <TypeTile value="multiple" label="Multiple" icon={Boxes} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thank_you_sent">Thank-you status</Label>
              <div className="grid grid-cols-2 gap-2">
                <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:border-gray-300">
                  <input
                    id="thank_you_sent"
                    name="thank_you_sent"
                    type="radio"
                    value="false"
                    checked={!thank}
                    onChange={() => setThank(false)}
                    className="accent-[#2d2d2d]"
                  />
                  Not sent
                </label>
                <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:border-gray-300">
                  <input
                    name="thank_you_sent"
                    type="radio"
                    value="true"
                    checked={thank}
                    onChange={() => setThank(true)}
                    className="accent-[#2d2d2d]"
                  />
                    <BadgeCheck className="h-4 w-4 text-[#2d2d2d]" />
                    Sent
                </label>
              </div>
            </div>

            {submitError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <DialogFooter
  className="sticky bottom-0 z-20 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 py-6"
  
>
  <div className="flex w-full gap-2">
    <Button
      type="button"
      variant="outline"
      onClick={() => setIsOpen(false)}
      className="h-[48px] flex-1 "
    >
      Cancel
    </Button>
    <Button
      type="submit"
      disabled={!guest.trim() || !desc.trim() || isSubmitting}
      className="h-[48px] flex-1  bg-[#A8E6CF] text-[#1f2937] hover:bg-[#98CFBA] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isSubmitting ? "Saving…" : "Save Changes"}
    </Button>
  </div>
</DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
