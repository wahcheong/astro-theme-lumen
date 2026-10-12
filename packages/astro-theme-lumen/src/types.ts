/**
 * Public config surface for `astro-theme-lumen`.
 *
 * A consumer writes a single `lumen.config.ts` at the project root:
 *
 * ```ts
 * import { defineLumenConfig } from "astro-theme-lumen/config";
 *
 * export default defineLumenConfig({
 *   site: { url: "https://example.com", title: "Example" },
 * });
 * ```
 */

/** Site-wide identity and metadata. */
export interface LumenSiteConfig {
  /** Canonical production URL, used for RSS, sitemap and absolute links. */
  url: string;
  /** Site title, shown in `<title>`, the header and the RSS channel. */
  title: string;
  /** Short description used for `<meta name="description">` and RSS. */
  description: string;
  /** Default author name for posts that do not declare one. */
  author: string;
  /** BCP-47 language tag, e.g. `en` or `zh-CN`. */
  lang: string;
  /** Text direction. */
  dir: "ltr" | "rtl";
  /** IANA timezone used to format every date on the site. */
  timezone: string;
  /** Social share card served from `public/`, relative to the site root. */
  ogImage: string;
}

/** A single social or contact link rendered in the profile and footer. */
export interface LumenLink {
  /** Stable identifier; decides which built-in icon is drawn. */
  name: string;
  /** Absolute URL, or a `mailto:` / `tel:` URI. */
  url: string;
  /** Optional accessible label override. */
  label?: string;
}

/** Navigation entry rendered in the header. */
export interface LumenNavItem {
  label: string;
  href: string;
  /**
   * Name of a built-in icon drawn before the label. Any Lucide name works
   * (`doc`, `calendar`, `map-pin`), and a fully qualified Iconify id
   * (`simple-icons:reddit`) is passed through as-is. Omit it for a plain text
   * entry. The icon is decorative — the label is always rendered.
   */
  icon?: string;
}

/**
 * Author details.
 *
 * Lumen leads with writing rather than with a personal profile, so this block
 * renders on the about page — never on the homepage.
 */
export interface LumenProfileConfig {
  /** Display name. Falls back to `site.author`. */
  name: string;
  /** One-line role or positioning statement. */
  tagline: string;
  /** Longer introduction, rendered on the about page. */
  bio: string;
  /** Avatar image living in `public/`, relative to the site root. */
  avatar: string;
  /** Free-form location string, e.g. `Shanghai, China`. */
  location: string;
  /** What you are working on right now. */
  now: string;
  /** Optional link to a résumé or CV (in `public/` or absolute). */
  resume: string;
  /** Render the author card at the top of the about page. */
  enabled: boolean;
}

/** Pagination and content-listing behaviour. */
export interface LumenPostsConfig {
  /** Posts per page on `/posts/[page]` listings. */
  perPage: number;
  /**
   * Recent posts shown on the homepage, excluding any marked `pinned`. Those
   * lead the same list rather than counting against this limit.
   */
  perIndex: number;
  /** How far in the future a post may be dated and still publish. */
  scheduledPostMargin: number;
  /** Collection that holds the blog posts. */
  collection: string;
  /** Collection that holds standalone pages such as `about`. */
  pagesCollection: string;
}

/** Toggleable theme capabilities. */
export interface LumenFeatures {
  /** Render the light/dark toggle and honour `prefers-color-scheme`. */
  lightAndDarkMode: boolean;
  /** Show an estimated reading time on post pages. */
  showReadingTime: boolean;
  /** Render a table of contents from the post headings. */
  showToc: boolean;
  /** Render an "edit this page" link on post pages. */
  showEditPost: boolean;
  /** Where the "edit this page" link points. */
  editPostUrl: string;
  /** Render the previous/next post back button. */
  showBackButton: boolean;
  /** Render share links on post pages. */
  showShareLinks: boolean;
  /** Render the footer navigation. */
  showFooter: boolean;
}

/**
 * The user-facing configuration object.
 *
 * Only {@link LumenSiteConfig} is required; everything else falls back to
 * defaults so a minimal config stays readable.
 */
export interface LumenUserConfig {
  site: LumenSiteConfig;
  profile?: Partial<LumenProfileConfig>;
  posts?: Partial<LumenPostsConfig>;
  features?: Partial<LumenFeatures>;
  socials?: LumenLink[];
  shareLinks?: LumenLink[];
  nav?: LumenNavItem[];
}

/** Configuration with every default applied. */
export interface ResolvedLumenConfig {
  site: LumenSiteConfig;
  profile: LumenProfileConfig;
  posts: LumenPostsConfig;
  features: LumenFeatures;
  socials: LumenLink[];
  shareLinks: LumenLink[];
  nav: LumenNavItem[];
}
