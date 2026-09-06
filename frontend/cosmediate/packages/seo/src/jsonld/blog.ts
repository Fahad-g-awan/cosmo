import { getSeoMessagesForContext } from "@cosmediate/i18n";
import type { Blog } from "@cosmediate/type-utils";

import { absoluteImage, buildBreadcrumbJsonLd } from "./shared";
import type { SiteContext } from "../resolve-site";
import { truncate } from "../utils";

export function buildBlogHomeJsonLd(
  ctx: SiteContext,
): Record<string, unknown>[] {
  const messages = getSeoMessagesForContext(ctx);
  return [
    buildBreadcrumbJsonLd(ctx, [{ name: messages.nav.home, path: "/" }]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: messages.blog.collectionName,
      url: ctx.origin,
    },
  ];
}

export function buildBlogPageJsonLd(
  ctx: SiteContext,
  blog: Blog,
): Record<string, unknown>[] {
  const messages = getSeoMessagesForContext(ctx);
  const path = `/${blog.id}`;
  const image = absoluteImage(ctx, blog.image);

  return [
    buildBreadcrumbJsonLd(ctx, [
      { name: messages.nav.home, path: "/" },
      { name: blog.title, path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: blog.title,
      url: new URL(path, ctx.origin).toString(),
      ...(blog.overview ? { description: truncate(blog.overview) } : {}),
      ...(image ? { image } : {}),
      datePublished: blog.publishedAt,
      dateModified: blog.updatedAt,
      author: {
        "@type": "Person",
        name: blog.authorName,
      },
      publisher: {
        "@type": "Organization",
        name: "Cosmediate",
        url: ctx.origin,
      },
    },
  ];
}

export function buildListingPageJsonLd(
  ctx: SiteContext,
  listing: "clinics" | "specialists" | "treatments",
): Record<string, unknown>[] {
  const messages = getSeoMessagesForContext(ctx);
  const label = messages.listings[listing].label;

  return [
    buildBreadcrumbJsonLd(ctx, [
      { name: messages.nav.home, path: "/" },
      { name: label, path: `/${listing}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: label,
      url: new URL(`/${listing}`, ctx.origin).toString(),
    },
  ];
}

export function buildMarketingPageJsonLd(
  ctx: SiteContext,
  title: string,
  path: string,
): Record<string, unknown>[] {
  const messages = getSeoMessagesForContext(ctx);
  return [
    buildBreadcrumbJsonLd(ctx, [
      { name: messages.nav.home, path: "/" },
      { name: title, path },
    ]),
  ];
}
