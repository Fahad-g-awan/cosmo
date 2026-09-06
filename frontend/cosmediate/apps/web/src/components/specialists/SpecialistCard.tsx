"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { FaRegComments, FaStar } from "react-icons/fa6";

export const SpecialistCard = ({
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

const Avatar = ({
  image,
  className,
  containerClassName,
}: {
  image: string;
  className?: string;
  containerClassName?: string;
}) => {
  const profile = useTranslations("profile");

  return (
    <div className={cn("w-[80px] h-[80px] rounded-full", containerClassName)}>
      <Image
        src={image || "/avatar.jpg"}
        alt={profile.cards.specialistImageAlt}
        width={500}
        height={500}
        className={cn("w-full h-full rounded-full object-cover", className)}
      />
    </div>
  );
};

const Name = ({
  name,
  variant,
  className,
}: {
  name: string;
  variant: "sm" | "lg";
  className?: string;
}) => {
  const profile = useTranslations("profile");

  return (
    <h1
      className={cn(
        variant === "lg" &&
          "w-full capitalize items-center justify-start font-semibold text-xl max-sm:text-[15px] leading-6 text-900 text-wrap",
        variant === "sm" &&
          "font-semibold capitalize text-[15px] leading-4 text-800",
        className,
      )}
    >
      {name || profile.cards.notAvailable}
    </h1>
  );
};

const Address = ({
  address,
  label,
  className,
}: {
  address: string;
  label?: string;
  className?: string;
}) => {
  const profile = useTranslations("profile");

  return (
    <div
      className={cn("w-full font-medium text-xs leading-4 text-500", className)}
    >
      {label && <span className="max-sm:hidden">{label}</span>}
      <span className={cn(label && "text-700 ml-1")}>
        {address || profile.cards.notAvailable}
      </span>
    </div>
  );
};

const Ratings = ({
  avgRating,
  reviewCount,
  className,
}: {
  avgRating: number;
  reviewCount: number;
  className?: string;
}) => {
  return (
    <div className={cn("flex items-center justify-start gap-3", className)}>
      <div className={cn("flex items-center justify-center gap-1")}>
        <FaStar className={cn("text-primary-accent size-4")} />
        <span className={cn("font-medium text-sm leading-5 text-500")}>
          {avgRating || 0}
        </span>
      </div>

      <div className={cn("flex items-center justify-center gap-1")}>
        <FaRegComments className={cn("text-[#D9C560] size-4")} />
        <span className={cn("font-medium text-sm leading-5 text-500")}>
          {reviewCount || 0}
        </span>
      </div>
    </div>
  );
};

const TimeSlots = ({
  slots,
  className,
}: {
  slots: string[];
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-start flex-wrap gap-2",
        className,
      )}
    >
      {slots.map((slot, index) => (
        <div
          key={index}
          className="font-medium text-700 text-xs leading-4 py-1 px-3 border border-stroke rounded-lg"
        >
          {slot}
        </div>
      ))}
    </div>
  );
};

const BookButton = ({
  id,
  label,
  className,
}: {
  id?: string;
  label?: string;
  className?: string;
}) => {
  const profile = useTranslations("profile");

  return (
    <Link
      className={cn(
        "font-bold text-primary-accent border-stroke border-2 hover:text-primary-accent-dark hover:bg-primary-accent-lite py-2 px-3 rounded-lg",
        className,
      )}
      href={`/specialists/${id}`}
    >
      {label || profile.cards.book}
    </Link>
  );
};

SpecialistCard.Avatar = Avatar;
SpecialistCard.Name = Name;
SpecialistCard.Address = Address;
SpecialistCard.Ratings = Ratings;
SpecialistCard.TimeSlots = TimeSlots;
SpecialistCard.BookButton = BookButton;
