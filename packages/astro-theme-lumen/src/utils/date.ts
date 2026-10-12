/**
 * Date formatting.
 *
 * Every date on a Lumen site is rendered in the timezone declared in
 * `lumen.config.ts`, so a post published at 00:30 in Shanghai shows the same
 * calendar day regardless of where the build runs.
 */

const FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function formatter(
  locale: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale}|${timeZone}|${JSON.stringify(options)}`;
  let cached = FORMATTERS.get(key);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, { timeZone, ...options });
    FORMATTERS.set(key, cached);
  }
  return cached;
}

/** Render a date as a machine-readable `<time datetime>` value. */
export function toDateTimeAttr(date: Date): string {
  return date.toISOString();
}

/** Human-readable date, e.g. `3 June 2025`. */
export function formatDate(
  date: Date,
  locale: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  return formatter(locale, timeZone, options).format(date);
}

/** Render a date as just the year, used by the archives page. */
export function formatYear(date: Date, locale: string, timeZone: string): string {
  return formatter(locale, timeZone, { year: "numeric" }).format(date);
}

/** Render a date as a `YYYY-MM` key, used for grouping. */
export function formatMonthKey(
  date: Date,
  locale: string,
  timeZone: string
): string {
  return formatter(locale, timeZone, {
    year: "numeric",
    month: "long",
  }).format(date);
}
