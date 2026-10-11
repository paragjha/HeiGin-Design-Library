/** Joins class names, skipping falsy values. Dependency-free stand-in for clsx. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
