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
import type { UIGift } from "@/components/giftlist/types";
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
    "non registry": { label: "Non Registry", badge: "bg-[#EAFBF3] text-[#2F6D5A] border-[#A8E6CF]" },
    monetary: { label: "Monetary", badge: "bg-[#EAFBF3] text-[#2F6D5A] border-[#A8E6CF]" },
    registry: { label: "Registry", badge: "bg-[#EAFBF3] text-[#2F6D5A] border-[#A8E6CF]" },
    multiple: { label: "Multiple", badge: "bg-[#EAFBF3] text-[#2F6D5A] border-[#A8E6CF]" },
  } as const;

  const meta = types[gift.type];
  const dateLabel = new Date(gift.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const noteBadge =
    noteStatus === "sent" ? (
      <Badge className="bg-[#A8E6CF] text-[#124C3A] border border-[#A8E6CF]"> 
        <CheckCircle className="h-3 w-3 mr-1" /> Note Sent
      </Badge>
    ) : noteStatus === "draft" ? (
      <Badge className="bg-[#EAFBF3] text-[#2F6D5A] border border-[#A8E6CF]">
        <FileText className="h-3 w-3 mr-1" /> Draft Saved
      </Badge>
    ) : null;

  return (
    <>
      <Card className="group relative overflow-hidden rounded-2xl border bg-tr border-gray-100 bg-white transition-shadow shadow-sm hover:shadow-md min-h-[320px] w-full">
        <article aria-labelledby={`gift-${gift.id}-title`}>
          <div className={`absolute inset-y-0 left-0 w-1 ${gift.thankYouSent ? "bg-[#A8E6CF]" : "bg-gray-200"}`} />
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 id={`gift-${gift.id}-title`} className="font-bold text-[#1a1a1a] text-2xl leading-snug break-words">
                {gift.guestName}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {dateLabel}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50"
              onClick={onDelete}
              aria-label={`Delete gift from ${gift.guestName}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`border ${meta.badge}`}>{meta.label}</Badge>
              {gift.thankYouSent ? (
                <Badge className="bg-[#A8E6CF] text-[#124C3A] border border-[#A8E6CF]">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Thanked
                </Badge>
              ) : (
                <Badge variant="outline" className="border border-[#A8E6CF]/50 text-[#2F6D5A]">
                  Not Thanked
                </Badge>
              )}
              {noteBadge}
            </div>
          </div>

          <div className="mt-3">
            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <p className="text-gray-700 text-[15px] leading-6 break-words hyphens-auto">
                {gift.description}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full max-w-[520px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-10 rounded-xl border border-[#A8E6CF]/50 bg-white text-[#2d2d2d] shadow-sm hover:bg-[#EAFBF3]
                             focus-visible:ring-2 focus-visible:ring-[#A8E6CF] focus-visible:ring-offset-0 justify-center whitespace-nowrap"
                  onClick={() => onRemind(gift)}
                  aria-label={`Set reminder for ${gift.guestName}`}
                >
                  <Bell className="h-4 w-4 mr-1.5 text-[#2F6D5A]" />
                  Remind
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-10 rounded-xl border border-[#A8E6CF]/50 bg-white text-[#2d2d2d] shadow-sm hover:bg-[#EAFBF3]
                             focus-visible:ring-2 focus-visible:ring-[#A8E6CF] focus-visible:ring-offset-0 justify-center whitespace-nowrap"
                  onClick={() => onEdit(gift)}
                  aria-label={`Edit gift from ${gift.guestName}`}
                >
                  <Edit className="h-4 w-4 mr-1.5 text-[#2F6D5A]" />
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-10 rounded-xl border border-[#A8E6CF]/50 bg-white text-[#2d2d2d] shadow-sm hover:bg-[#EAFBF3]
                             focus-visible:ring-2 focus-visible:ring-[#A8E6CF] focus-visible:ring-offset-0 justify-center whitespace-nowrap"
                  onClick={onCompose}
                  aria-label={`Compose thank you for ${gift.guestName}`}
                >
                  <Mail className="h-4 w-4 mr-1.5 text-[#2F6D5A]" />
                  Compose
                </Button>
              </div>
            </div>

            <form action={toggleThankYou} className="mt-3">
              <input type="hidden" name="id" value={gift.id} />
              <input type="hidden" name="next" value={pathname} />
              <Button
                size="sm"
                className={`w-full h-11 rounded-xl font-medium transition-colors ${
                  gift.thankYouSent
                    ? "border border-[#A8E6CF] bg-[#EAFBF3] text-[#2d2d2d] hover:bg-[#E1F6EE]"
                    : "border border-[#A8E6CF]/50 bg-transparent text-[#2d2d2d] hover:bg-[#EAFBF3]"
                }`}
                type="submit"
              >
                {gift.thankYouSent ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-[#2F6D5A]" />
                    Thank You Sent
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4 text-[#2F6D5A]" />
                    Mark as Thanked
                  </>
                )}
              </Button>
            </form>
          </div>
        </CardContent>
        </article>
      </Card>
    </>
  );
}
