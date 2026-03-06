import type { GiftType } from "@/app/types/database";
import type { ImportGiftItem } from "@/components/giftlist/types";
import { normalizeYmd } from "@/lib/date";

export const GIFT_TYPES = [
  "non registry",
  "monetary",
  "registry",
  "multiple",
] as const satisfies readonly GiftType[];

export function isGiftType(value: string): value is GiftType {
  return GIFT_TYPES.includes(value as GiftType);
}

export function normalizeGiftType(value: string | null | undefined): GiftType {
  const normalized = String(value ?? "").trim().toLowerCase();
  return isGiftType(normalized) ? normalized : "non registry";
}

export function buildGiftSignature(input: {
  guestName: string;
  description: string;
  type: GiftType;
  date: string;
}) {
  return `${input.guestName.trim().toLowerCase()}|${input.description.trim().toLowerCase()}|${input.type}|${input.date}`;
}

export function sanitizeGiftFields(input: {
  guestName: string;
  description: string;
  giftType: string | null | undefined;
  dateReceived?: string | null;
  thankYouSent?: boolean;
}) {
  return {
    guestName: input.guestName.trim(),
    description: input.description.trim(),
    giftType: normalizeGiftType(input.giftType),
    dateReceived: normalizeYmd(input.dateReceived),
    thankYouSent: Boolean(input.thankYouSent),
  };
}

export function sanitizeImportGiftItem(
  item: Partial<ImportGiftItem> | null | undefined
): ImportGiftItem | null {
  const guestName = String(item?.guestName ?? "").trim();
  const description = String(item?.description ?? "").trim();

  if (!guestName || !description) {
    return null;
  }

  return {
    guestName,
    description,
    type: normalizeGiftType(item?.type),
    date: normalizeYmd(item?.date),
    thankYouSent: Boolean(item?.thankYouSent),
  };
}

export function dedupeImportGiftItems(items: Array<Partial<ImportGiftItem> | null | undefined>) {
  const seen = new Set<string>();
  const normalized: ImportGiftItem[] = [];

  for (const item of items) {
    const safeItem = sanitizeImportGiftItem(item);
    if (!safeItem) {
      continue;
    }

    const signature = buildGiftSignature(safeItem);
    if (seen.has(signature)) {
      continue;
    }

    seen.add(signature);
    normalized.push(safeItem);
  }

  return normalized;
}
