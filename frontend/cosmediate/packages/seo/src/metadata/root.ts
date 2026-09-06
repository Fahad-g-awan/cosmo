import type { Metadata } from "next";

import {
  AUTH_DEFAULT_DESCRIPTION,
  AUTH_DEFAULT_TITLE,
  DASHBOARD_DEFAULT_DESCRIPTION,
  DASHBOARD_DEFAULT_TITLE,
} from "../site";
import { getSeoMessagesForContext } from "@cosmediate/i18n";
import type { SiteContext } from "../resolve-site";

const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
};

const INDEX_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
};

function robotsForContext(ctx: SiteContext): Metadata["robots"] {
  return ctx.indexable ? INDEX_ROBOTS : NOINDEX_ROBOTS;
}

export function buildRootMetadata(ctx: SiteContext): Metadata {
  const metadataBase = new URL(ctx.origin);
  const robots = robotsForContext(ctx);
  const messages = getSeoMessagesForContext(ctx);

  switch (ctx.app) {
    case "web":
      return {
        metadataBase,
        title: {
          default: messages.web.defaultTitle,
          template: `%s | ${messages.siteName}`,
        },
        description: messages.web.defaultDescription,
        robots,
      };

    case "blog":
      return {
        metadataBase,
        title: {
          default: messages.blog.defaultTitle,
          template: `%s | ${messages.blog.defaultTitle}`,
        },
        description: messages.blog.defaultDescription,
        robots,
      };

    case "auth":
      return {
        metadataBase,
        title: {
          default: AUTH_DEFAULT_TITLE,
          template: `%s | Cosmediate`,
        },
        description: AUTH_DEFAULT_DESCRIPTION,
        robots: NOINDEX_ROBOTS,
      };

    case "app":
      return {
        metadataBase,
        title: {
          default: DASHBOARD_DEFAULT_TITLE,
          template: `%s | Cosmediate Dashboard`,
        },
        description: DASHBOARD_DEFAULT_DESCRIPTION,
        robots: NOINDEX_ROBOTS,
      };
  }
}
