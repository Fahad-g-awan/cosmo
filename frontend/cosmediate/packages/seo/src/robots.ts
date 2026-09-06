import type { MetadataRoute } from "next";

import type { SiteContext } from "./resolve-site";

const PRIVATE_APP_DISALLOW = ["/"];

const PUBLIC_PROD_DISALLOW = ["/api/", "/auth/"];

/**
 * Build robots.txt rules for the current request host and app.
 */
export function buildRobots(ctx: SiteContext): MetadataRoute.Robots {
  if (ctx.app === "auth" || ctx.app === "app") {
    return {
      rules: {
        userAgent: "*",
        disallow: PRIVATE_APP_DISALLOW,
      },
    };
  }

  if (!ctx.indexable) {
    return {
      rules: {
        userAgent: "*",
        disallow: PRIVATE_APP_DISALLOW,
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PUBLIC_PROD_DISALLOW,
    },
    sitemap: new URL("/sitemap.xml", ctx.origin).toString(),
  };
}
