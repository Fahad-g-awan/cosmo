import BlogDetails from "@blog/features/Blog/BlogDetails";
import {
  JsonLd,
  buildBlogCanonicalUrl,
  buildBlogMetadataById,
  buildBlogPageJsonLd,
  fetchBlogServer,
  resolveSiteContext,
} from "@cosmediate/seo";
import type { Metadata } from "next";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: id } = await params;
  const ctx = await resolveSiteContext("blog");
  return buildBlogMetadataById(ctx, id);
}

export default async function Page({ params }: PageProps) {
  const { slug: id } = await params;
  const ctx = await resolveSiteContext("blog");
  const blog = await fetchBlogServer(id);
  const shareUrl = buildBlogCanonicalUrl(ctx, id);

  return (
    <>
      {blog ? <JsonLd data={buildBlogPageJsonLd(ctx, blog)} /> : null}
      <BlogDetails shareUrl={shareUrl} initialBlog={blog} />
    </>
  );
}
