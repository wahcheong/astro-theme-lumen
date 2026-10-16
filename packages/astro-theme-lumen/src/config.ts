import type {
  LumenFeatures,
  LumenNavItem,
  LumenPostsConfig,
  LumenSiteConfig,
  LumenUserConfig,
  ResolvedLumenConfig,
} from "./types";

/** Baseline configuration; every field a consumer may omit. */
export const DEFAULT_CONFIG: ResolvedLumenConfig = {
  site: {
    url: "https://example.com/",
    title: "Lumen",
    description: "An Astro theme for blogs.",
    author: "Anonymous",
    lang: "en",
    dir: "ltr",
    timezone: "UTC",
    ogImage: "default-og.jpg",
  },
  posts: {
    perPage: 6,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
    collection: "posts",
    pagesCollection: "pages",
  },
  features: {
    lightAndDarkMode: true,
    showReadingTime: true,
    showToc: true,
    showEditPost: false,
    editPostUrl: "",
    showBackButton: true,
    showShareLinks: true,
    showFooter: true,
  },
  socials: [],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/sharing/share-offsite/?url=",
    },
    { name: "mail", url: "mailto:?body=" },
  ],
  nav: [
    { label: "Posts", href: "/posts", icon: "book-open" },
    { label: "Tags", href: "/tags", icon: "tag" },
    { label: "Archives", href: "/archives", icon: "calendar" },
    { label: "About", href: "/about", icon: "anchor" },
  ],
};

/** Route toggles the integration passes in, used to prune default nav entries. */
export interface NavPruning {
  archives?: boolean;
  tags?: boolean;
  about?: boolean;
}

/**
 * Identity helper that gives editors autocomplete and type checking inside
 * `lumen.config.ts` without forcing the consumer to import a type.
 */
export function defineLumenConfig(config: LumenUserConfig): LumenUserConfig {
  return config;
}

/**
 * Merge a partial user configuration over the defaults.
 *
 * Collection-valued keys (`socials`, `shareLinks`, `nav`) are replaced rather
 * than concatenated, so a consumer can intentionally ship an empty list.
 */
export function resolveLumenConfig(user: LumenUserConfig): ResolvedLumenConfig {
  const site: LumenSiteConfig = { ...DEFAULT_CONFIG.site, ...(user.site ?? {}) };

  const posts: LumenPostsConfig = {
    ...DEFAULT_CONFIG.posts,
    ...(user.posts ?? {}),
  };

  const features: LumenFeatures = {
    ...DEFAULT_CONFIG.features,
    ...(user.features ?? {}),
  };

  const nav: LumenNavItem[] = user.nav ?? DEFAULT_CONFIG.nav;

  return {
    site,
    posts,
    features,
    socials: user.socials ?? DEFAULT_CONFIG.socials,
    shareLinks: user.shareLinks ?? DEFAULT_CONFIG.shareLinks,
    nav,
  };
}

/**
 * Remove default nav entries whose route was switched off in the integration
 * options. Entries the consumer listed explicitly are always kept.
 */
export function pruneNav(
  config: ResolvedLumenConfig,
  routes: NavPruning
): ResolvedLumenConfig {
  if (routes.archives === false && routes.tags === false && routes.about === false) {
    return config;
  }

  const userProvidedNav = config.nav !== DEFAULT_CONFIG.nav;

  return {
    ...config,
    nav: config.nav.filter(item => {
      if (userProvidedNav) return true;
      if (routes.archives === false && item.href === "/archives") return false;
      if (routes.tags === false && item.href === "/tags") return false;
      if (routes.about === false && item.href === "/about") return false;
      return true;
    }),
  };
}
