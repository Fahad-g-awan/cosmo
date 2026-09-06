import Blogs from "@blog/features/Blog";
import {
  JsonLd,
  buildBlogHomeJsonLdForContext,
  buildBlogHomeMetadata,
  resolveSiteContext,
} from "@cosmediate/seo";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("blog");
  return buildBlogHomeMetadata(ctx);
}

export default async function Page() {
  const ctx = await resolveSiteContext("blog");

  return (
    <>
      <JsonLd data={buildBlogHomeJsonLdForContext(ctx)} />
      <Blogs />
    </>
  );
}
