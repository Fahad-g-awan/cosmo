"use client";

import React, { useCallback, useEffect, useState } from "react";

import { SiteContainer, BlogCardLoader } from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";
import { getTopSearchedBlogsApi } from "@cosmediate/api";
import { Blog } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { BlogCard } from "@blog/components/BlogCard";
import { truncateText } from "@blog/lib/utils";

const TopSearchedBlogs = () => {
  const blogMessages = useTranslations("blog");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTopSearchedBlogs = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await getTopSearchedBlogsApi({
        limit: 3,
        filters: { allowZeroSearchClicks: true },
      });

      if (res.success && res.items?.length) {
        setBlogs(res.items);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching top searched blogs:", error);
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopSearchedBlogs();
  }, [fetchTopSearchedBlogs]);

  const showLoading = blogs.length === 0 && isLoading;
  const showContent = blogs.length > 0 && !isLoading;

  return (
    <div className={cn("w-full flex flex-col justify-start items-center mb-5")}>
      <SiteContainer>
        {showLoading && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <BlogCardLoader />
            <BlogCardLoader />
            <BlogCardLoader />
          </div>
        )}

        {showContent && (
          <div className="w-full flex flex-col gap-5 items-start justify-start">
            <div className="text-xl font-bold text-900">
              {blogMessages.topViewed}
            </div>
            <div
              className={cn(
                "container grid items-center justify-items-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-sm:gap-6",
              )}
            >
              {blogs.map((blog) => (
                <BlogCard href={blog.id} key={blog.id}>
                  <BlogCard.Image
                    src={blog.image}
                    alt={blog.title}
                    containerClassName="max-sm:h-[200px] h-[200px]"
                  />
                  <BlogCard.DateLabel date={blog.publishedAt} />
                  <BlogCard.Category category={blog.categoryName} />
                  <BlogCard.Title title={blog.title} />
                  <BlogCard.Description
                    description={truncateText(blog?.overview || "", 50)}
                  />
                </BlogCard>
              ))}
            </div>
          </div>
        )}
      </SiteContainer>
    </div>
  );
};

export default TopSearchedBlogs;
