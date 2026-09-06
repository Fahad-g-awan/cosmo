"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { ScrollArea } from "@cosmediate/ui/components/scroll-area";
import { useTranslations } from "@cosmediate/i18n/client";
import { getRelatedBlogsApi } from "@cosmediate/api";
import { MoreArticlesLoader } from "@cosmediate/ui";
import { Blog } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { truncateText } from "@blog/lib/utils";
import { BlogCard } from "./BlogCard";

import { ChevronRight } from "lucide-react";

const MoreArticles = ({ blogSlugId }: { blogSlugId: string }) => {
  const blogMessages = useTranslations("blog");
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRelatedBlogs = useCallback(async () => {
    if (!blogSlugId) return;

    try {
      setIsLoading(true);

      const res = await getRelatedBlogsApi({
        id: blogSlugId,
        limit: 5,
      });

      if (res.success && res.items?.length) {
        setRelatedBlogs(res.items);
      } else {
        setRelatedBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching related articles:", error);
      setRelatedBlogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [blogSlugId]);

  useEffect(() => {
    fetchRelatedBlogs();
  }, [fetchRelatedBlogs]);

  const showLoading = relatedBlogs.length === 0 && isLoading;
  const showContent = relatedBlogs.length > 0 && !isLoading;

  return (
    <div className={cn("w-full flex flex-col items-start justify-start gap-6")}>
      {showLoading && <MoreArticlesLoader />}

      {showContent && (
        <>
          <div className={cn("w-full flex justify-between items-center gap-2")}>
            <h1 className={cn("font-bold leading-6 text-700")}>
              {blogMessages.moreArticles}
            </h1>

            <Link
              href="/"
              className={cn(
                "text-sm text-500 leading-5 flex items-center gap-2 cursor-pointer hover:text-700 transition-all duration-300",
              )}
            >
              {blogMessages.viewAll}
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <ScrollArea
            className="w-full max-sm:-[600px]"
            orientation="horizontal"
          >
            <div
              className={cn(
                "w-full",
                "grid grid-cols-1 gap-12",
                "max-lg:grid-cols-3",
                "max-sm:flex max-lg:gap-8 max-sm:gap-[21px] max-sm:grid-cols-none",
              )}
            >
              {relatedBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="max-sm:min-w-[300px] max-sm:scroll-snap-start"
                >
                  <BlogCard href={blog.id}>
                    <BlogCard.Image
                      src={blog.image}
                      alt={blog.title}
                      containerClassName="h-[200px]"
                    />
                    <BlogCard.Category category={blog.categoryName} />
                    <BlogCard.Title title={blog.title} />
                    <BlogCard.Description
                      description={truncateText(blog.overview || "", 70)}
                      className="w-full h-[20px]"
                    />
                  </BlogCard>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default MoreArticles;
