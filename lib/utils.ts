import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a price in Haitian Gourdes, e.g. 1500 -> "1 500 HTG" */
export function formatHTG(value: number) {
  return `${value.toLocaleString("fr-FR")} HTG`;
}
