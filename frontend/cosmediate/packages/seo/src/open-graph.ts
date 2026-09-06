import type { Metadata } from "next";

import type { SiteContext } from "./resolve-site";
import { toAbsoluteUrl } from "./utils";

export interface SocialMetadataInput {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  type?: "website" | "article";
  publishedAt?: string;
  author?: string;
  defaultImagePath?: string;
}

export function buildSocialMetadata(
  ctx: SiteContext,
  input: SocialMetadataInput,
): Pick<Metadata, "openGraph" | "twitter"> {
  const image =
    toAbsoluteUrl(ctx.origin, input.image) ??
    toAbsoluteUrl(ctx.origin, input.defaultImagePath ?? "/logos/logo.svg");

  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: input.title }]
    : undefined;

  return {
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.url,
      siteName: "Cosmediate",
      locale: ctx.ogLocale,
      type: input.type ?? "website",
      images,
      ...(input.publishedAt ? { publishedTime: input.publishedAt } : {}),
      ...(input.author ? { authors: [input.author] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: image ? [image] : undefined,
    },
  };
}
