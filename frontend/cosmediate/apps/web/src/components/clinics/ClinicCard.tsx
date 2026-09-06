"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { FaRegComments } from "react-icons/fa6";
import { Star } from "lucide-react";
import { ScrollArea } from "@cosmediate/ui/index";

export const ClinicCard = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full flex flex-col items-start justify-start gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
};

const Logo = ({ logo, className }: { logo: string; className?: string }) => {
  const profile = useTranslations("profile");

  // if (!logo) return null;

  return (
    <div
      className={cn(
        "w-[80px] h-[58px] rounded-lg border bg-white p-2",
        className,
      )}
    >
      <Image
        src={logo || "/placeholder.jpg"}
        width={500}
        height={500}
        alt={profile.cards.clinicLogoAlt}
        className={cn("w-full h-full object-cover rounded-md")}
      />
    </div>
  );
};

const ClinicImage = ({
  image,
  logo,
  className,
}: {
  image: string;
  logo: string;
  className?: string;
}) => {
  const profile = useTranslations("profile");

  // if (!image || !logo) return null;

  return (
    <div className={cn("relative w-[290px] h-[180px] rounded-xl", className)}>
      <Image
        src={image || "/placeholder.jpg"}
        width={500}
        height={500}
        alt={profile.cards.clinicImageAlt}
        className={cn("w-full h-full object-cover rounded-xl")}
      />

      <Logo logo={logo} className="absolute right-2 top-2" />
    </div>
  );
};

const Title = ({
  title,
  variant,
  className,
}: {
  title: string;
  variant: "sm" | "lg";
  className?: string;
}) => {
  const profile = useTranslations("profile");

  return (
    <div
      className={cn(
        variant === "lg" &&
          "text-700 text-[27px] leading-[32px] font-semibold max-sm:text-[20px] max-sm:leading-[26px] capitalize",
        variant === "sm" &&
          "text-700 text-[15px] leading-[15px] font-semibold capitalize",
        className,
      )}
    >
      {title ? title : profile.cards.notAvailable}
    </div>
  );
};

const Address = ({
  address,
  className,
}: {
  address: string;
  className?: string;
}) => {
  const profile = useTranslations("profile");

  return (
    <div
      className={cn(
        "h-10 text-400 text-[11px] leading-[17px] font-medium",
        className,
      )}
    >
      {address ? address : profile.cards.notAvailable}
    </div>
  );
};

const Ratings = ({
  ratings,
  className,
}: {
  ratings: {
    avgRating: number;
    reviewCount: number;
  };
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-start gap-[24px]",
        className,
      )}
    >
      <div className={cn("flex items-center justify-center gap-1")}>
        <Star size={20} className={cn("text-primary-accent opacity-70")} />
        <span className={cn("text-[14px] leading-[21px] font-medium text-500")}>
          {ratings?.avgRating || 0}
        </span>
      </div>

      <div className={cn("flex items-center justify-center gap-1")}>
        <FaRegComments size={20} className={cn("text-yellow-400 opacity-70")} />
        <span className={cn("text-[14px] leading-[21px] font-medium text-500")}>
          {ratings?.reviewCount || 0}
        </span>
      </div>
    </div>
  );
};

const Categories = ({
  categories,
  className,
}: {
  categories: string[];
  className?: string;
}) => {
  if (!categories || categories?.length === 0) return null;

  return (
    <ScrollArea className="w-full" orientation="horizontal">
      <div
        className={cn(
          "flex w-max min-w-full flex-nowrap items-start justify-start gap-2",
          className,
        )}
      >
        {categories.map((category, index) => (
          <div
            key={`${category}-${index}`}
            className="flex shrink-0 items-center justify-center gap-1 rounded-lg border border-stroke px-3 py-1"
          >
            <span className="whitespace-nowrap text-[11px] font-medium capitalize leading-[17px] text-700">
              {category}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

const BookButton = ({ id, className }: { id: string; className?: string }) => {
  const profile = useTranslations("profile");

  return (
    <Link
      className={cn(
        "font-bold text-primary-accent border-stroke border-2 hover:text-primary-accent-dark hover:bg-primary-accent-lite py-2 px-3 rounded-lg",
        className,
      )}
      href={`/home/clinics/${id}`}
    >
      {profile.cards.explore}
    </Link>
  );
};

ClinicCard.Logo = Logo;
ClinicCard.Image = ClinicImage;
ClinicCard.Title = Title;
ClinicCard.Address = Address;
ClinicCard.Ratings = Ratings;
ClinicCard.Categories = Categories;
ClinicCard.BookButton = BookButton;
