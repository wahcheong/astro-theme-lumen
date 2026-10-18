/** Bare specifier the theme surfaces its resolved configuration under. */
export const VIRTUAL_CONFIG_ID = "virtual:astro-theme-lumen/config";

/** Rollup/Vite-internal id the virtual module resolves to. */
export const RESOLVED_VIRTUAL_CONFIG_ID = "\0" + VIRTUAL_CONFIG_ID;

/**
 * Bare specifier the theme loads the consumer's Tailwind entry through.
 *
 * Injected routes are owned by the package, so the consumer has nowhere to
 * `import` their own stylesheet from. This virtual module bridges that gap.
 */
export const VIRTUAL_STYLES_ID = "virtual:astro-theme-lumen/styles";

/** Rollup/Vite-internal id the styles virtual module resolves to. */
export const RESOLVED_VIRTUAL_STYLES_ID = "\0" + VIRTUAL_STYLES_ID;

/**
 * Bare specifier carrying KaTeX's stylesheet.
 *
 * Resolves to an empty module unless the consumer switches math on, so sites
 * without formulas never pay for KaTeX's CSS or fonts.
 */
export const VIRTUAL_MATH_ID = "virtual:astro-theme-lumen/math";

/** Rollup/Vite-internal id the math virtual module resolves to. */
export const RESOLVED_VIRTUAL_MATH_ID = "\0" + VIRTUAL_MATH_ID;

/** Consumer stylesheet probed under the project root, in priority order. */
export const USER_STYLESHEET_CANDIDATES = [
  "src/styles/global.css",
  "src/styles/global.scss",
  "src/global.css",
  "styles/global.css",
] as const;

/** Config filenames probed at the project root, in priority order. */
export const USER_CONFIG_FILE_NAMES = [
  "lumen.config.ts",
  "lumen.config.mts",
  "lumen.config.js",
  "lumen.config.mjs",
] as const;

/** Injection name reported to Astro's logger and dev toolbar. */
export const INTEGRATION_NAME = "astro-theme-lumen";
