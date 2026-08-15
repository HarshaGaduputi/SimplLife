/** String utility functions */

/**
 * Highlight occurrences of `query` inside `text` by wrapping them in <mark> tags.
 * Returns an array of React-renderable parts: { text, highlight }.
 */
export function highlightParts(text: string, query: string): Array<{ text: string; highlight: boolean }> {
  if (!query.trim()) return [{ text, highlight: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part) => ({
    text: part,
    highlight: part.toLowerCase() === query.toLowerCase(),
  }));
}

/** Generate a short unique ID (non-cryptographic, client-side only) */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Capitalize the first letter of a string */
export function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Truncate string to max length with ellipsis */
export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

/** Convert a template name to a URL-safe slug */
export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
