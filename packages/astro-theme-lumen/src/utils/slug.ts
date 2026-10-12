/**
 * Slug generation for tags and any other user-supplied label that ends up in
 * a URL. Latin text is transliterated and kebab-cased; CJK characters are kept
 * verbatim so a Chinese tag stays readable instead of collapsing to a hash.
 */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    // Strip combining marks left behind by NFKD.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "tag";
}
