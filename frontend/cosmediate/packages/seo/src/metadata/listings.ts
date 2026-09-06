import type { Metadata } from "next";

import { getSeoMessagesForContext } from "@cosmediate/i18n";

import { buildBlogHomeJsonLd, buildListingPageJsonLd } from "../jsonld/blog";
import { buildPublicPageMetadata } from "./build-page";
import type { SiteContext } from "../resolve-site";

export type ListingPageKey = "clinics" | "specialists" | "treatments";

export function buildListingMetadata(
  ctx: SiteContext,
  key: ListingPageKey,
): Metadata {
  const page = getSeoMessagesForContext(ctx).listings[key];
  return buildPublicPageMetadata(ctx, {
    title: page.title,
    description: page.description,
    path: `/${key}`,
  });
}

export function buildListingPageJsonLdForKey(
  ctx: SiteContext,
  key: ListingPageKey,
): Record<string, unknown>[] {
  return buildListingPageJsonLd(ctx, key);
}

export function buildBlogHomeMetadata(ctx: SiteContext): Metadata {
  const messages = getSeoMessagesForContext(ctx);
  return buildPublicPageMetadata(ctx, {
    title: messages.blog.defaultTitle,
    description: messages.blog.defaultDescription,
    path: "/",
  });
}

export function buildBlogHomeJsonLdForContext(
  ctx: SiteContext,
): Record<string, unknown>[] {
  return buildBlogHomeJsonLd(ctx);
}
