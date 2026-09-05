/**
 * Tiny className joiner (dependency-free clsx substitute).
 * Filters out falsy values so conditional classes stay readable.
 */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
