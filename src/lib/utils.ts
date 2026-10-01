/**
 * Tiny class-name joiner (clsx/tailwind-merge are intentionally not deps).
 * Filters out falsy values so conditional classes read cleanly.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Normalise a display name (or any label) to title case — "aMMAR bASHIR haruna"
 * and "AMMAR BASHIR HARUNA" both become "Ammar Bashir Haruna". Underscores and
 * dashes are treated as word separators so enum-style values like
 * "pending_review" render as "Pending Review".
 */
export function titleCase(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)(\p{L})/gu, (_m, space: string, letter: string) => space + letter.toUpperCase());
}
