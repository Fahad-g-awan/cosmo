import React from "react";

import { SiteContainer, BlogsPreviewLoader } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import TitleSection from "./components/TitleSection";
import { Blog } from "@cosmediate/type-utils/blog";
import BlogCard from "./components/BlogCard";

interface BlogSectionProps {
  blogs: Blog[];
  isLoading: boolean;
}

const BlogSection = ({ blogs, isLoading }: BlogSectionProps) => {
  const showBlogs = blogs.length > 0 && !isLoading;
  const showLoader = blogs.length < 1 && isLoading;

  if (!showBlogs && !showLoader) return <div></div>;

  return (
    <SiteContainer>
      <div
        className={cn(
          "w-full flex items-start justify-center max-lg:flex-col gap-5"
        )}
      >
        <TitleSection />

        {showBlogs && (
          <div
            className={cn(
              "w-full overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:scrollbar-hide max-sm:pb-2"
            )}
          >
            <div
              className={cn(
                "w-full max-sm:w-[750px] grid grid-cols-3 items-center justify-start gap-8 max-sm:gap-3"
              )}
            >
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        )}

        {showLoader && (
          <div className="w-full max-sm:w-full flex items-center justify-start">
            <BlogsPreviewLoader />
          </div>
        )}
      </div>
    </SiteContainer>
  );
};

export default BlogSection;
