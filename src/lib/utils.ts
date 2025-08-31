import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSiteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  return url.startsWith("http") ? url : `https://${url}`;
}

// Prevent open redirect: only allow in-app paths that start with a single "/"
export function safeNextPath(next?: string | null) {
  if (!next || typeof next !== "string") return "/giftlist";
  if (!next.startsWith("/") || next.startsWith("//")) return "/giftlist";
  return next;
}