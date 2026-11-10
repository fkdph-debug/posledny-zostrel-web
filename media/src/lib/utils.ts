import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDay(isoDate: string) {
  // isoDate = "YYYY-MM-DD" – bez posunu časového pásma
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("sk-SK", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const isImage = (mime: string | null) => !!mime && mime.startsWith("image/");
export const isVideo = (mime: string | null) => !!mime && mime.startsWith("video/");

export const safeName = (n: string) =>
  n.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
