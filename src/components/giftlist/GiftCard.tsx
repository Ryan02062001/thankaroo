"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail, CheckCircle, Calendar, Trash2,
  FileText,
  Bell,
  Edit,
  ChevronDown,
} from "lucide-react";
import type { UIGift } from "@/components/giftlist/types";
import { AnimatePresence, motion } from "framer-motion";

export function GiftCard({
  gift,
  noteStatus,
  onEdit,
  onRemind,
  onCompose,
  onDelete,
  onToggleThankYou,
}: {
  gift: UIGift;
  noteStatus: "none" | "draft" | "sent";
  onEdit: (gift: UIGift) => void;
  onRemind: (gift: UIGift) => void;
  onCompose: () => void;
  onDelete: () => void;
  onToggleThankYou: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

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
      <Card className="group relative overflow-hidden rounded-2xl border bg-tr border-gray-100 bg-white transition-shadow shadow-sm hover:shadow-md md:min-h-[320px] w-full py-3 md:py-6">
        <article aria-labelledby={`gift-${gift.id}-title`}>
          <div className={`absolute inset-y-0 left-0 w-1 ${gift.thankYouSent ? "bg-[#A8E6CF]" : "bg-gray-200"}`} />
        <CardContent className="flex h-full flex-col p-4 pb-0 md:p-5 relative">
          {/* Summary header (click to toggle on mobile) */}
          <div
            role="button"
            tabIndex={0}
            aria-controls={panelId}
            aria-expanded={isOpen}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("button, a, [role='button']")) return;
              setIsOpen((v) => !v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen((v) => !v);
              }
            }}
            className="flex items-start justify-between gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-[#A8E6CF] md:cursor-default cursor-pointer pr-0"
          >
            <div className="min-w-0">
              <h3 id={`gift-${gift.id}-title`} className="font-bold text-[#1a1a1a] text-2xl leading-snug break-words">
                {gift.guestName}
              </h3>
              {/* Desktop-only date under name */}
              <div className="mt-1 hidden items-center gap-2 text-sm text-gray-500 md:flex">
                <Calendar className="h-4 w-4" />
                {dateLabel}
              </div>
            </div>

            {/* Delete (desktop) and chevron (mobile) */}
            <div className="flex items-center gap-2">
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
          </div>

          {/* Mobile chevron moved below content; removed absolute positioning */}

          <div
            className="mt-3"
            onClick={() => setIsOpen((v) => !v)}
            role="presentation"
          >
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

          <div
            className="mt-3"
            onClick={() => setIsOpen((v) => !v)}
            role="presentation"
          >
            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <p className="text-gray-700 text-[15px] leading-6 break-words hyphens-auto">
                {gift.description}
              </p>
            </div>
          </div>

          {/* Desktop actions remain visible; hidden on mobile */}
          <div className="mt-4 hidden md:block">
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

            <div className="mt-3">
              <Button
                size="sm"
                className={`w-full h-11 rounded-xl font-medium transition-colors ${
                  gift.thankYouSent
                    ? "border border-[#A8E6CF] bg-[#EAFBF3] text-[#2d2d2d] hover:bg-[#E1F6EE]"
                    : "border border-[#A8E6CF]/50 bg-transparent text-[#2d2d2d] hover:bg-[#EAFBF3]"
                }`}
                type="button"
                onClick={onToggleThankYou}
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
            </div>
          </div>

          {/* Mobile-only collapsible details: date, delete, and actions */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                id={panelId}
                key="mobile-details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: "hidden" }}
                className="md:hidden"
              >
                <div className="pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {dateLabel}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="w-full max-w-[520px] mx-auto">
                      <div className="grid grid-cols-1 gap-2">
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

                    <div className="mt-3">
                      <Button
                        size="sm"
                        className={`w-full h-11 rounded-xl font-medium transition-colors ${
                          gift.thankYouSent
                            ? "border border-[#A8E6CF] bg-[#EAFBF3] text-[#2d2d2d] hover:bg-[#E1F6EE]"
                            : "border border-[#A8E6CF]/50 bg-transparent text-[#2d2d2d] hover:bg-[#EAFBF3]"
                        }`}
                        type="button"
                        onClick={onToggleThankYou}
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
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom-centered mobile chevron under everything */}
          <div className="md:hidden mt-2 flex justify-center">
            <button
              type="button"
              aria-label={isOpen ? "Collapse gift details" : "Expand gift details"}
              onClick={() => setIsOpen((v) => !v)}
              className="rounded-full p-1.5 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#A8E6CF] focus-visible:outline-none"
            >
              <ChevronDown
                className={`h-8 w-8 text-[#6B7280] transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </CardContent>
        </article>
      </Card>
    </>
  );
}
