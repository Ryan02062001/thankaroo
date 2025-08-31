"use client";

import * as React from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { createGift } from "@/app/actions/gifts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePathname } from "next/navigation";
import {
  Gift as GiftIcon, DollarSign, Package, Boxes,
  CalendarDays
} from "lucide-react";
import { useFormStatus } from "react-dom";

type GiftType = "non registry" | "monetary" | "registry" | "multiple";

function SubmitButton({ disabled, className }: { disabled?: boolean; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={disabled || pending}
      className={`bg-[#A8E6CF] text-[#1f2937] hover:bg-[#98CFBA] disabled:opacity-60 disabled:cursor-not-allowed ${className || ""}`}
    >
      {pending ? "Adding…" : "Add Gift"}
    </Button>
  );
}

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

  const [guest, setGuest] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [type, setType] = React.useState<GiftType>("non registry");
  const [date, setDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = React.useState<{ guest?: string; desc?: string }>({});

  const today = new Date().toISOString().slice(0, 10);

  const validate = React.useCallback(() => {
    const next: typeof errors = {};
    if (!guest.trim()) next.guest = "Please enter the guest’s name.";
    if (!desc.trim()) next.desc = "Please describe the gift.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [guest, desc]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!validate()) e.preventDefault();
  };

  const TypeTile = ({
    value,
    label,
    icon: Icon,
    hint,
  }: {
    value: GiftType;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    hint?: string;
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
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8E6CF] focus-visible:ring-offset-2",
          active
            ? "border-[#A8E6CF] bg-[#A8E6CF]/10 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
        ].join(" ")}
      >
        <span
          className={[
            "inline-flex h-8 w-8 items-center justify-center rounded-lg",
            active ? "bg-[#A8E6CF]/30" : "bg-gray-50",
          ].join(" ")}
          aria-hidden
        >
          <Icon className="h-4 w-4 text-gray-700" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-medium text-gray-900">{label}</span>
          {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
        </span>
      </button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span style={{ display: "none" }} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#A8E6CF] via-[#98CFBA] to-[#8cc4b0]" />

        <div className="p-5 sm:p-6">
          <DialogHeader className="space-y-2">
            
            <DialogTitle className="text-2xl font-bold text-[#1f2937]">Add New Gift</DialogTitle>
            <DialogDescription className="text-gray-600">
              Capture the essentials now—you can refine later.
            </DialogDescription>
          </DialogHeader>

          <form action={createGift} onSubmit={onSubmit} className="mt-4 space-y-5">
            <input type="hidden" name="list_id" value={listId} />
            <input type="hidden" name="redirect_to" value={pathname} />
            <input type="hidden" name="gift_type" value={type} />

            <div className="space-y-2">
              <Label htmlFor="guest_name">Guest name</Label>
              <Input
                id="guest_name"
                name="guest_name"
                autoFocus
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                aria-invalid={!!errors.guest}
                aria-describedby={errors.guest ? "guest_name_error" : undefined}
                placeholder="e.g., Alex Johnson"
              />
              {errors.guest ? (
                <p id="guest_name_error" className="text-xs text-red-600">{errors.guest}</p>
              ) : (
                <p className="text-xs text-gray-500">Who gave the gift?</p>
              )}
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
                aria-describedby={errors.desc ? "desc_error" : "desc_help"}
                placeholder="e.g., Stainless steel cookware set"
                className="min-h-[88px] resize-y"
                maxLength={500}
              />
              {errors.desc ? (
                <p id="desc_error" className="text-xs text-red-600">{errors.desc}</p>
              ) : (
                <div id="desc_help" className="flex items-center justify-between text-xs text-gray-500">
                  <span>Be specific—helps when writing thank-yous.</span>
                  <span>{desc.length}/500</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gift type</Label>
              <div role="radiogroup" className="grid grid-cols-2 gap-2">
                <TypeTile value="non registry" label="Non-registry" icon={Package} hint="Not from the registry" />
                <TypeTile value="monetary" label="Monetary" icon={DollarSign} hint="Cash, check, gift card" />
                <TypeTile value="registry" label="Registry" icon={GiftIcon} hint="From your registry" />
                <TypeTile value="multiple" label="Multiple" icon={Boxes} hint="Group of items" />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <SubmitButton
                  disabled={!guest.trim() || !desc.trim()}
                  className="flex-1"
                />
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
