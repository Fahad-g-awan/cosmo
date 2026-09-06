"use client";

import { useRouter } from "next/navigation";
import { DateTime } from "luxon";
import Image from "next/image";
import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";
import { useTranslations } from "@cosmediate/i18n/client";

import { Blog } from "@cosmediate/type-utils/blog";
import { truncateText } from "@web/lib/utils";

const BlogCard = ({ blog }: { blog: Blog }) => {
  const shared = useTranslations("marketing").shared;
  const formattedDate = blog.publishedAt
    ? DateTime.fromISO(blog.publishedAt).toFormat("dd LLL yyyy")
    : null;
  const router = useRouter();

  const imageSrc =
    blog?.image?.startsWith("/") || blog?.image?.startsWith("http")
      ? blog.image
      : "/placeholder.jpg";

  return (
    <div
      onClick={() => router.push(`/blogs/${blog.id}`)}
      className={cn("flex w-full flex-col gap-2 cursor-pointer")}
    >
      <div className="w-full h-[180px] rounded-lg overflow-hidden">
        <Image
          src={imageSrc}
          alt={blog?.title || shared.blogImageFallback}
          width={500}
          height={300}
          quality={100}
          priority
          className="w-full h-full object-cover rounded-lg hover:scale-105 transition-all duration-300"
        />
      </div>
      <p className="text-[11px] text-400 leading-3">
        {formattedDate || shared.dateFallback}
      </p>

      <div
        className={cn(
          "w-full flex flex-col items-start justify-self-auto gap-1"
        )}
      >
        <h2
          className={cn(
            "text-700 font-bold leading-[22px] max-sm:leading-[17px] text-wrap",
            "text-[18px] max-sm:text-[14px] capitalize"
          )}
        >
          {truncateText(blog.title, 50)}
        </h2>
        <p className="text-xs h-10 text-700">
          {truncateText(blog.overview || "", 55)}
        </p>
      </div>
    </div>
  );
};

export default BlogCard;
