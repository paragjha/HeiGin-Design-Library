import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Kokonut-pattern `cn`: merge class lists, let later tokens win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
