import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { formatINR } from "@/lib/utils/formatINR";
import { whatsappLink } from "@/lib/data/site";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { formatINR, whatsappLink };
