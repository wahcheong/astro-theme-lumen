/**
 * Date formatting.
 *
 * Every date on a Lumen site is rendered in the timezone declared in
 * `lumen.config.ts`, so a post published at 00:30 in Shanghai shows the same
 * calendar day regardless of where the build runs.
 *
 * Output is always ISO 8601 (`YYYY-MM-DD`), never a localised date. A numeric
 * date reads the same in every language, and month names are the part of a
 * localised date that ages worst in a listing.
 */

const FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function formatter(
  timeZone: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  let cached = FORMATTERS.get(key);
  if (!cached) {
    // The calendar and the digits are pinned so the output keeps its YYYY-MM-DD
    // shape whatever `site.lang` happens to be.
    cached = new Intl.DateTimeFormat("en", {
      timeZone,
      calendar: "gregory",
      numberingSystem: "latn",
      ...options,
    });
    FORMATTERS.set(key, cached);
  }
  return cached;
}

function field(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find(part => part.type === type)?.value ?? "";
}

/** Render a date as a machine-readable `<time datetime>` value. */
export function toDateTimeAttr(date: Date): string {
  return date.toISOString();
}

/** ISO 8601 calendar date, e.g. `2025-06-03`. */
export function formatDate(date: Date, timeZone: string): string {
  const parts = formatter(timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return `${field(parts, "year")}-${field(parts, "month")}-${field(parts, "day")}`;
}

/** Just the year, used by the archives and the footer. */
export function formatYear(date: Date, timeZone: string): string {
  return formatter(timeZone, { year: "numeric" }).format(date);
}
