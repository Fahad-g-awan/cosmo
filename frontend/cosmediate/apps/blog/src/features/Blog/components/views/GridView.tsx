import React from "react";

import { Blog } from "@cosmediate/type-utils";

import { BlogCard } from "@blog/components/BlogCard";
import { truncateText } from "@blog/lib/utils";

export const GridView = ({ blog }: { blog: Blog }) => {
  return (
    <BlogCard href={blog.id}>
      <BlogCard.Image
        src={blog.image}
        alt={blog.title}
        containerClassName="max-sm:h-[200px]"
      />
      <BlogCard.DateLabel date={blog.publishedAt} />
      <BlogCard.Category category={blog.categoryName} />
      <BlogCard.Title title={blog.title} />
      <BlogCard.Description
        description={truncateText(blog.overview || "", 100)}
        className="w-full h-[50px]"
      />
    </BlogCard>
  );
};
