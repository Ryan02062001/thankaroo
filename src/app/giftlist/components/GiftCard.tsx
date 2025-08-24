"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Mail, CheckCircle, Calendar, Edit, Bell, MoreVertical, Trash2 } from "lucide-react"
import { deleteGift, toggleThankYou } from "@/app/actions/gifts"
import type { UIGift } from "../giftlist-client"
import { usePathname } from "next/navigation"

export function GiftCard({
  listId,
  gift,
  onEdit,
  onRemind,
}: {
  listId: string
  gift: UIGift
  onEdit: (gift: UIGift) => void
  onRemind: (gift: UIGift) => void
}) {
  const pathname = usePathname()

  const types = {
    "non registry": { label: "Non Registry", badge: "bg-sky-50 text-sky-700 border-sky-200" },
    monetary: { label: "Monetary", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    registry: { label: "Registry", badge: "bg-violet-50 text-violet-700 border-violet-200" },
    multiple: { label: "Multiple", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  } as const

  const meta = types[gift.type]
  const dateLabel = new Date(gift.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow shadow-sm hover:shadow-md min-h-[320px] w-full">
      <div className={`absolute inset-y-0 left-0 w-1 ${gift.thankYouSent ? "bg-[#A8E6CF]" : "bg-red-300"}`} />
      <CardContent className="p-0 flex h-full flex-col">
        {/* Header (name + date) without left icons */}
        <div className="p-5 pb-0 pt-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-[#1a1a1a] text-2xl">{gift.guestName}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {dateLabel}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 rounded-xl">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(gift)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Gift
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRemind(gift)} className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  Set Reminder
                </DropdownMenuItem>
                {/* Draft Note removed; drafting happens in /thankyou */}
                <DropdownMenuItem asChild>
                  <form action={deleteGift} className="w-full">
                    <input type="hidden" name="id" value={gift.id} />
                    <input type="hidden" name="list_id" value={listId} />
                    <input type="hidden" name="next" value={pathname} />
                    <button
                      type="submit"
                      className="flex w-full items-center px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Gift
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tags row (always row 3) */}
        <div className="px-5 pt-0 mt-2 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`border ${meta.badge}`}>
              {meta.label}
            </Badge>
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
          </div>
        </div>

        {/* Description */}
        <div className="mt-2 px-5 pb-0">
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-gray-700 text-[15px] leading-6 break-words">{gift.description}</p>
          </div>
        </div>

        {/* Bottom-aligned group: icons/buttons + CTA, always docked to bottom */}
        <div className="mt-auto px-5 pb-4">
          <div className="flex flex-wrap items-center gap-6 mb-2">
            <Button variant="ghost" size="sm" onClick={() => onRemind(gift)}>
              <Bell className="h-4 w-4" />
              <span className="ml-1">Remind</span>
            </Button>
            {/* Draft button removed */}
            <Button variant="ghost" size="sm" onClick={() => onEdit(gift)}>
              <Edit className="h-4 w-4" />
              <span className="ml-1">Edit</span>
            </Button>
          </div>
          <form action={toggleThankYou}>
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
  )
}