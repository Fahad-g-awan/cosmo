import React from "react";

import { Blog } from "@cosmediate/type-utils";

import { BlogCard } from "@blog/components/BlogCard";
import { truncateText } from "@blog/lib/utils";

export const ListView = ({ blog }: { blog: Blog }) => {
  return (
    <BlogCard href={blog.id} className="flex-row gap-5 max-sm:flex-col">
      <BlogCard.Image
        src={blog.image}
        alt={blog.title}
        containerClassName="w-[280px] h-[180px] max-sm:w-full max-sm:h-50 shrink-0"
      />
      <div className="flex flex-col items-start justify-center gap-2">
        <BlogCard.Title title={blog.title} />
        <BlogCard.DateLabel date={blog.publishedAt} />
        <BlogCard.Category category={blog.categoryName} />
        <BlogCard.Description
          description={truncateText(blog.overview || "", 150)}
        />
      </div>
    </BlogCard>
  );
};
