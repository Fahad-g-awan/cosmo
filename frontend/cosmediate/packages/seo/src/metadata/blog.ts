import type { Metadata } from "next";
import type { Blog } from "@cosmediate/type-utils";

import { getSeoMessagesForContext } from "@cosmediate/i18n";

import { buildPublicPageMetadata } from "./build-page";
import type { SiteContext } from "../resolve-site";
import { fetchBlogServer } from "../fetch/server";
import { truncate } from "../utils";

function buildBlogDescription(ctx: SiteContext, blog: Blog): string {
  const m = getSeoMessagesForContext(ctx);

  if (blog.overview) {
    return truncate(blog.overview);
  }

  return truncate(m.blog.readArticleBy(blog.title, blog.authorName));
}

export function buildBlogMetadata(ctx: SiteContext, blog: Blog): Metadata {
  return buildPublicPageMetadata(ctx, {
    title: blog.title,
    description: buildBlogDescription(ctx, blog),
    path: `/${blog.id}`,
    image: blog.image,
    type: "article",
    publishedAt: blog.publishedAt,
    author: blog.authorName,
  });
}

export async function buildBlogMetadataById(
  ctx: SiteContext,
  id: string,
): Promise<Metadata> {
  const blog = await fetchBlogServer(id);
  if (!blog) {
    return { title: getSeoMessagesForContext(ctx).notFound.article };
  }

  return buildBlogMetadata(ctx, blog);
}

export function buildBlogCanonicalUrl(
  ctx: SiteContext,
  blogId: string,
): string {
  return new URL(`/${blogId}`, ctx.origin).toString();
}
