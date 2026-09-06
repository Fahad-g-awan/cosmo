"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { DateTime } from "luxon";

export const BlogCard = ({
  children,
  className,
  href,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) => {
  const Wrapper = href ? Link : "div";

  return (
    <Wrapper
      href={href || ""}
      onClick={onClick}
      className={cn("flex w-full flex-col gap-2 cursor-pointer", className)}
    >
      {children}
    </Wrapper>
  );
};

const CardImage = ({
  src,
  alt,
  children,
  className,
  containerClassName,
}: {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const blogMessages = useTranslations("blog");

  return (
    <div
      className={cn(
        "w-full relative h-100 rounded-lg overflow-hidden bg-200",
        containerClassName,
      )}
    >
      {src && (
        <Image
          src={src}
          alt={alt || blogMessages.imageAlt}
          width={500}
          height={500}
          quality={100}
          priority
          className={cn(
            "w-full h-full object-cover rounded-lg hover:scale-105 transition-all duration-300",
            className,
          )}
        />
      )}
      {children}
    </div>
  );
};

const DateLabel = ({
  date,
  className,
}: {
  date?: string;
  className?: string;
}) => {
  const blogMessages = useTranslations("blog");
  const formattedDate = date
    ? DateTime.fromISO(date).toFormat("dd LLL yyyy")
    : null;

  // if (!formattedDate) return null;

  return (
    <p
      className={cn(
        "text-[12px] font-medium text-gray-500 leading-4",
        className,
      )}
    >
      {formattedDate ? formattedDate : blogMessages.dateFallback}
    </p>
  );
};

const Category = ({
  category,
  className,
}: {
  category?: string;
  className?: string;
}) => {
  if (!category) return null;

  return (
    <p
      className={cn(
        "text-sm capitalize font-medium text-gray-500 leading-4",
        className,
      )}
    >
      {category}
    </p>
  );
};

const Title = ({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) => {
  if (!title) return null;

  return (
    <h2
      className={cn(
        "text-700 capitalize font-bold leading-[22px] max-sm:leading-[17px] text-wrap",
        "text-[18px] max-sm:text-[14px]",
        className,
      )}
    >
      {title}
    </h2>
  );
};

const Description = ({
  description,
  className,
}: {
  description?: string;
  className?: string;
}) => {
  if (!description) return null;

  return (
    <p
      className={cn(
        "text-500 leading-[22px] max-sm:leading-[17px] text-wrap text-sm",
        className,
      )}
    >
      {description}
    </p>
  );
};

BlogCard.Image = CardImage;
BlogCard.DateLabel = DateLabel;
BlogCard.Category = Category;
BlogCard.Title = Title;
BlogCard.Description = Description;
