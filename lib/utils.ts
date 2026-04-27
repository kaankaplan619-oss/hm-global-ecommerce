import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `HM-${year}-${rand}`;
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "…";
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function canCancelOrder(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  return now - created < thirtyMinutes;
}

export function getRemainingCancelTime(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  return Math.max(0, thirtyMinutes - (now - created));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// Matches bucket "customer-logos" allowed_mime_types + file_size_limit
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

export const ALLOWED_FILE_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".svg"];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB — matches bucket file_size_limit

export function validateLogoFile(file: File): { valid: boolean; error?: string } {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Le fichier est trop volumineux (max 10 Mo)." };
  }

  const isAllowed =
    ALLOWED_FILE_TYPES.includes(file.type) ||
    ALLOWED_FILE_EXTENSIONS.includes(ext);

  if (!isAllowed) {
    return {
      valid: false,
      error: `Format non supporté. Formats acceptés : PDF, PNG, JPG, WEBP, SVG.`,
    };
  }

  return { valid: true };
}
