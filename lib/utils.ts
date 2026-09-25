import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { formatINR } from "@/lib/utils/formatINR";

const WHATSAPP_NUMBER = "919488713438";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { formatINR };

export function whatsappLink(message = ""): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
