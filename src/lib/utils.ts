/**
 * Tiny class-name joiner (clsx/tailwind-merge are intentionally not deps).
 * Filters out falsy values so conditional classes read cleanly.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
