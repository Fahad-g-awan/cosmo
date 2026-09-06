import type { Metadata } from "next";

import { buildHreflangAlternates, shouldEmitHreflang } from "../hreflang";
import { buildCanonicalUrl, capitalizePageTitle } from "../utils";
import { buildSocialMetadata } from "../open-graph";
import type { SiteContext } from "../resolve-site";

export interface PublicPageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedAt?: string;
  author?: string;
}

export function buildPublicPageMetadata(
  ctx: SiteContext,
  input: PublicPageMetadataInput,
): Metadata {
  const title = capitalizePageTitle(input.title);
  const url = buildCanonicalUrl(ctx.origin, input.path);
  const social = buildSocialMetadata(ctx, {
    title,
    description: input.description,
    url,
    image: input.image,
    type: input.type,
    publishedAt: input.publishedAt,
    author: input.author,
  });

  const alternates: Metadata["alternates"] = { canonical: url };

  if (shouldEmitHreflang(ctx)) {
    alternates.languages = buildHreflangAlternates(
      ctx.app as "web" | "blog",
      input.path,
    );
  }

  return {
    title,
    description: input.description,
    alternates,
    ...social,
  };
}
