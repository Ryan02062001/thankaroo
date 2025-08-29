"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail, CheckCircle, Calendar, Trash2,
  FileText,
  Bell,
  Edit,
} from "lucide-react";
import { toggleThankYou } from "@/app/actions/gifts";
import type { UIGift } from "../gift-hub-client";
import { usePathname } from "next/navigation";

export function GiftCard({
  gift,
  noteStatus,
  onEdit,
  onRemind,
  onCompose,
  onDelete,
}: {
  gift: UIGift;
  noteStatus: "none" | "draft" | "sent";
  onEdit: (gift: UIGift) => void;
  onRemind: (gift: UIGift) => void;
  onCompose: () => void;
  onDelete: () => void;
}) {
  const pathname = usePathname();

  const types = {
    "non registry": { label: "Non Registry", badge: "bg-sky-50 text-sky-700 border-sky-200" },
    monetary: { label: "Monetary", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    registry: { label: "Registry", badge: "bg-violet-50 text-violet-700 border-violet-200" },
    multiple: { label: "Multiple", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  } as const;

  const meta = types[gift.type];
  const dateLabel = new Date(gift.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const noteBadge =
    noteStatus === "sent" ? (
      <Badge className="bg-green-100 text-green-800 border border-green-200"> 
        <CheckCircle className="h-3 w-3 mr-1" /> Note Sent
      </Badge>
    ) : noteStatus === "draft" ? (
      <Badge className="bg-[#A8E6CF] text-gray-800 border border-[#A8E6CF]/60">
        <FileText className="h-3 w-3 mr-1" /> Draft Saved
      </Badge>
    ) : null;

  return (
    <>
      <Card className="group relative overflow-hidden rounded-2xl border bg-tr border-gray-100 bg-white transition-shadow shadow-sm hover:shadow-md min-h-[320px] w-full">
        {/* left status rail */}
        <div className={`absolute inset-y-0 left-0 w-1 ${gift.thankYouSent ? "bg-[#A8E6CF]" : "bg-red-300"}`} />
        <CardContent className="flex h-full flex-col p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-[#1a1a1a] text-2xl leading-snug break-words">
                {gift.guestName}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {dateLabel}
              </div>
            </div>

            {/* Delete button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={onDelete}
              aria-label={`Delete gift from ${gift.guestName}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Tags row */}
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`border ${meta.badge}`}>{meta.label}</Badge>
              {gift.thankYouSent ? (
                <Badge className="bg-[#A8E6CF] text-gray-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Thanked
                </Badge>
              ) : (
                <Badge variant="outline" className="border border-gray-200 text-gray-600">
                  Not Thanked
                </Badge>
              )}
              {noteBadge}
            </div>
          </div>

          {/* Description */}
          <div className="mt-3">
            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <p className="text-gray-700 text-[15px] leading-6 break-words hyphens-auto">
                {gift.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4">
            {/* Centered, equal-sized trio */}
            <div className="w-full max-w-[520px] mx-auto">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50
                             focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0 justify-center whitespace-nowrap"
                  onClick={() => onRemind(gift)}
                  aria-label={`Set reminder for ${gift.guestName}`}
                >
                  <Bell className="h-4 w-4 mr-1.5 text-gray-600" />
                  Remind
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50
                             focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0 justify-center whitespace-nowrap"
                  onClick={() => onEdit(gift)}
                  aria-label={`Edit gift from ${gift.guestName}`}
                >
                  <Edit className="h-4 w-4 mr-1.5 text-gray-600" />
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50
                             focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0 justify-center whitespace-nowrap"
                  onClick={onCompose}
                  aria-label={`Compose thank you for ${gift.guestName}`}
                >
                  <Mail className="h-4 w-4 mr-1.5 text-gray-600" />
                  Compose
                </Button>
              </div>
            </div>

            {/* Mark-as-Thanked */}
            <form action={toggleThankYou} className="mt-3">
              <input type="hidden" name="id" value={gift.id} />
              <input type="hidden" name="next" value={pathname} />
              <Button
                size="sm"
                className={`w-full h-11 rounded-xl font-medium transition-colors ${
                  gift.thankYouSent
                    ? "border border-[#A8E6CF]/60 bg-[#EAFBF3] text-[#2d2d2d] hover:bg-[#E1F6EE]"
                    : "border border-gray-200 bg-transparent text-[#2d2d2d] hover:bg-[#A8E6CF]"
                }`}
                type="submit"
              >
                {gift.thankYouSent ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Thank You Sent
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Mark as Thanked
                  </>
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </>
  );
}