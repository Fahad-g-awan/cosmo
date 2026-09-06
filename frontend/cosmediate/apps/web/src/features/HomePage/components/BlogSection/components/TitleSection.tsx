"use client";

import React from "react";
import Link from "next/link";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { ArrowDownRight } from "lucide-react";

const TitleSection = () => {
  const blog = useTranslations("marketing").home.blog;

  return (
    <div
      className={cn(
        "w-[30%] flex flex-col justify-start gap-5 max-lg:w-full",
        "max-lg:justify-between max-lg:flex-row max-lg:items-start",
        "max-sm:flex-col max-sm:justify-center max-sm:items-center max-sm:text-center"
      )}
    >
      <div
        className={cn(
          "w-full flex flex-col justify-start items-start gap-3 max-sm:items-center"
        )}
      >
        <h2 className="text-[50px] max-xl:text-[40px] max-sm:text-[50px] font-bold leading-[50px] text-700">
          {blog.title}
        </h2>
        <p className="text-700 font-bold text-[12px] max-xl:text-[10px] max-sm:text-[12px] leading-[16.8px]">
          {blog.subtitle}
        </p>
      </div>

      <Link
        href={"/blog"}
        className={cn(
          "group max-lg:w-40 flex items-center justify-start max-sm:justify-center gap-2 font-bold text-[12px]  text-primary-accent/75 hover:text-primary-accent transition-all duration-200"
        )}
      >
        {blog.readAllPosts}
        <ArrowDownRight className="-rotate-90 size-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
};

export default TitleSection;
