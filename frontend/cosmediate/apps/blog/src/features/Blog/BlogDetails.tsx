"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DateTime } from "luxon";
import Image from "next/image";

import {
  BlogDetailsPageLoader,
  InfoMessage,
  SiteContainer,
} from "@cosmediate/ui";
import { tiptapJsonToHtml } from "@cosmediate/ui/modules/HtmlRichText/utils/tiptapToHtml";
import HtmlViewer from "@cosmediate/ui/modules/HtmlRichText/HtmlViewer";
import { Breadcrumbs } from "@cosmediate/ui/components/breadcrumb";
import { useTranslations } from "@cosmediate/i18n/client";
import { Blog } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { getBlogApi } from "@cosmediate/api";
import { NoDataFound } from "@cosmediate/ui";

import MoreArticles from "../../components/MoreArticlas";
import BlogHeader from "@blog/components/BlogHeader";
import { SHARE_URLS } from "@blog/lib/share";

import { FaSquareWhatsapp, FaSquareTwitter, FaLinkedin } from "react-icons/fa6";
import { FaFacebookSquare } from "react-icons/fa";

const BlogDetailsInner = ({
  shareUrl,
  initialBlog,
}: {
  shareUrl?: string;
  initialBlog?: Blog | null;
}) => {
  const blogMessages = useTranslations("blog");
  const nav = useTranslations("nav");
  const common = useTranslations("common");
  const [blog, setBlog] = useState<Blog | null>(initialBlog ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialBlog);
  const [hasError, setHasError] = useState<boolean>(false);

  const { slug: blogSlugId } = useParams();

  const fetchBlog = useCallback(async () => {
    if (!blogSlugId) return;

    try {
      setIsLoading(true);
      setHasError(false);

      const res = await getBlogApi({
        id: blogSlugId as string,
        from: "listing",
      });

      if (res.success && res.item) {
        setBlog(res.item);
      } else {
        setBlog(null);
        setHasError(true);
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      setBlog(null);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [blogSlugId]);

  useEffect(() => {
    if (!blogSlugId) return;

    if (initialBlog?.id === blogSlugId) {
      return;
    }

    fetchBlog();
  }, [blogSlugId, initialBlog, fetchBlog]);

  const breadcrumbs = blog
    ? [
        { label: nav.home, path: process.env.NEXT_PUBLIC_SITE_URL },
        { label: nav.blog, path: "/" },
        { label: `${blog.title}` },
      ]
    : [];

  const formattedDate = blog?.publishedAt
    ? DateTime.fromISO(blog?.publishedAt).toFormat("dd LLL yyyy")
    : null;

  const blogUrl =
    shareUrl || (typeof window !== "undefined" ? window.location.href : "");

  const showLoading = isLoading;
  const showContent = blog && !isLoading;
  const showNotFound = !isLoading && (hasError || !blog);

  return (
    <div className={cn("w-full flex flex-col justify-center items-center")}>
      {showLoading && (
        <div className="w-full mb-10">
          <BlogDetailsPageLoader />
        </div>
      )}
      {!showLoading && showNotFound && (
        <NoDataFound
          message={blogMessages.postNotFound}
          description={common.pleaseTryAgainLater}
          className="my-30"
        />
      )}

      {showContent && (
        <div
          className={cn(
            "w-full flex flex-col justify-start items-center gap-10",
          )}
        >
          <BlogHeader>
            <Breadcrumbs items={breadcrumbs} />
            <BlogHeader.Title>{blog?.title}</BlogHeader.Title>
          </BlogHeader>

          <SiteContainer className="w-full flex-row max-lg:flex-col items-start max-lg:justify-start justify-start mb-10 gap-8 max-lg:gap-6 max-sm:gap-4">
            <div
              className={cn(
                "flex flex-col gap-4 items-start justify-start ",
                "w-[75%] max-lg:w-[100%]",
              )}
            >
              <div
                className={cn(
                  "w-full font-medium text-800 text-wrap",
                  "text-[20px] max-lg:text-[16px] max-sm:text-[16px]",
                  "leading-7 max-lg:leading-6 ",
                )}
              >
                {blog?.overview}
              </div>
              {formattedDate && (
                <p className={cn("font-medium text-[12px] leading-4 text-500")}>
                  {blogMessages.publishedAt(formattedDate)}
                </p>
              )}

              <div
                className={cn(
                  "w-full h-[500px] rounded-2xl bg-200 overflow-hidden",
                )}
              >
                {blog?.image && (
                  <Image
                    src={blog?.image || "/image.png"}
                    alt={blogMessages.imageAlt}
                    width={500}
                    height={500}
                    quality={100}
                    priority
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div
                className={cn(
                  "w-full flex items-start justify-start gap-3",
                  "gap-8 max-lg:gap-6 max-sm:gap-4",
                )}
              >
                <div className={cn("w-[20px] flex flex-col gap-4")}>
                  <a
                    href={SHARE_URLS.whatsapp(blogUrl, blog.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaSquareWhatsapp className="size-8 max-sm:size-5" />
                  </a>
                  <a
                    href={SHARE_URLS.facebook(blogUrl, blog.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebookSquare className="size-8 max-sm:size-5" />
                  </a>
                  <a
                    href={SHARE_URLS.twitter(blogUrl, blog.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaSquareTwitter className="size-8 max-sm:size-5" />
                  </a>
                  <a
                    href={SHARE_URLS.linkedin(blogUrl, blog.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin className="size-8 max-sm:size-5" />
                  </a>
                </div>

                <div
                  className={cn(
                    "w-full flex flex-col items-start justify-start gap-2",
                  )}
                >
                  {blog?.content && (
                    <HtmlViewer html={tiptapJsonToHtml(blog.content)} />
                  )}
                  {!blog?.content && (
                    <InfoMessage
                      className="mt-10"
                      message={blogMessages.contentLoadError}
                    />
                  )}
                </div>
              </div>

              <Tags tags={blog?.tags} />
            </div>

            <div
              className={cn(
                "w-[25%] max-lg:w-full flex flex-col items-center justify-start",
              )}
            >
              <MoreArticles blogSlugId={blogSlugId as string} />
            </div>
          </SiteContainer>
        </div>
      )}
    </div>
  );
};

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="w-full inline-flex flex-wrap items-start justify-start gap-2 text-400 text-xs">
      {tags?.map((tag: string) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  );
};

export const BlogDetails = ({
  shareUrl,
  initialBlog,
}: {
  shareUrl?: string;
  initialBlog?: Blog | null;
}) => {
  return (
    <Suspense fallback={<BlogDetailsPageLoader />}>
      <BlogDetailsInner shareUrl={shareUrl} initialBlog={initialBlog} />
    </Suspense>
  );
};

export default BlogDetails;
