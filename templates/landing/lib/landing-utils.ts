import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's built-in font sizes. Without this it reads the custom
// sizes below as text *colors*, so cn("text-headline", "text-foreground") would drop the size.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["2xs", "md", "nav", "badge", "label", "page-title-mobile", "display", "headline", "subhead"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Two-letter monogram used wherever a logo image has not been supplied. */
export function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? `${words[0]![0]}${words[1]![0]}` : name.trim().slice(0, 2);
  return letters.toUpperCase();
}
