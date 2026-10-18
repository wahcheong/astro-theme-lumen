import type {
  LumenFeatures,
  LumenNavItem,
  LumenPostsConfig,
  LumenRoutesConfig,
  LumenSiteConfig,
  LumenUserConfig,
  ResolvedLumenConfig,
} from "./types";

/** Baseline configuration; every field a consumer may omit. */
export const DEFAULT_CONFIG: Omit<ResolvedLumenConfig, "routes"> = {
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

/**
 * Route toggles the integration passes in.
 *
 * Feeds both the nav pruning below and the `routes` block that components read
 * to decide whether to render a link to an optional route.
 */
export interface NavPruning {
  archives?: boolean;
  tags?: boolean;
  about?: boolean;
  search?: boolean;
  rss?: boolean;
  notFound?: boolean;
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
export function resolveLumenConfig(
  user: LumenUserConfig
): Omit<ResolvedLumenConfig, "routes"> {
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

/** Default nav entries that only exist while their route is switched on. */
const NAV_ROUTE_GUARDS: ReadonlyArray<[href: string, option: keyof NavPruning]> = [
  ["/archives", "archives"],
  ["/tags", "tags"],
  ["/about", "about"],
];

/**
 * Reconcile the resolved config with the route toggles.
 *
 * Two jobs: drop default nav entries whose route was switched off (entries the
 * consumer listed explicitly are always kept), and attach the flags themselves
 * so components can hide an affordance that points at a route that is gone.
 */
export function pruneNav(
  config: Omit<ResolvedLumenConfig, "routes">,
  routes: NavPruning
): ResolvedLumenConfig {
  const flags: LumenRoutesConfig = {
    tags: routes.tags !== false,
    archives: routes.archives !== false,
    about: routes.about !== false,
    search: routes.search !== false,
    rss: routes.rss !== false,
    notFound: routes.notFound !== false,
  };

  const userProvidedNav = config.nav !== DEFAULT_CONFIG.nav;
  const nav = userProvidedNav
    ? config.nav
    : config.nav.filter(
        item =>
          !NAV_ROUTE_GUARDS.some(
            ([href, option]) => routes[option] === false && item.href === href
          )
      );

  return { ...config, nav, routes: flags };
}
