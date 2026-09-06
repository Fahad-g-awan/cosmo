"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

type TreatmentCardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export const TreatmentCard = ({ children, className }: TreatmentCardProps) => {
  return (
    <div
      className={cn(
        "relative rounded-lg flex flex-col items-start justify-start gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const CardImage = ({
  src,
  alt,
  children,
  className,
  containerClassName,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div className={cn("w-full relative rounded-lg", containerClassName)}>
      <div
        className={cn("w-full h-full overflow-hidden rounded-lg", className)}
      >
        <Image
          src={src || "/placeholder.jpg"}
          alt={alt || "treatment"}
          width={500}
          height={500}
          className={cn("rounded-lg w-full h-full object-cover")}
        />

        {/* {!src && <div className="h-full w-full rounded-lg bg-100" />} */}
      </div>
      {children}
    </div>
  );
};

const Labels = ({
  clinicCount,
  doctorCount,
}: {
  clinicCount: number;
  doctorCount: number;
}) => {
  const profile = useTranslations("profile");

  return (
    <div className="w-full flex gap-2 absolute bottom-2 left-2">
      <div
        className={cn(
          "bg-white min-w-14 min-h-10 px-2 py-1 rounded-lg flex flex-col items-start justify-center",
        )}
      >
        <span className="text-[10px] text-700">{profile.cards.clinics}</span>
        <span className="text-left text-xs font-semibold pl-px">
          {clinicCount}
        </span>
      </div>

      <div className="bg-white min-w-14 min-h-10 px-2 py-1 rounded-lg flex flex-col items-start justify-center">
        <span className="text-[10px] text-700">{profile.cards.doctors}</span>
        <span className="text-left text-xs font-semibold pl-px">
          {doctorCount}
        </span>
      </div>
    </div>
  );
};

const Category = ({ category }: { category: string }) => {
  return (
    <div
      className={cn(
        "absolute top-2 right-3 capitalize text-700 leading-[17px] text-[11px] font-medium bg-white py-[4px] px-[12px] rounded-[8px]",
      )}
    >
      {category}
    </div>
  );
};

const CardPrice = ({
  price,
  className,
}: {
  price: number;
  className?: string;
}) => {
  const profile = useTranslations("profile");

  return (
    <div
      className={cn(
        "absolute -bottom-[12px] right-[18px] font-bold text-900 leading-[17px] book-btn text-[11px] h-8 w-25 py-2 px-3 rounded-lg hero-gradient flex items-center justify-center",
        className,
      )}
    >
      {profile.cards.fromPrice(price)}
    </div>
  );
};

const Title = ({ title }: { title: string }) => {
  return (
    <h3
      className={cn(
        "w-full mt-2 capitalize text-[18px] max-xl:text-base leading-[22px] font-bold text-700",
      )}
    >
      {title}
    </h3>
  );
};

const Description = ({
  description,
  className,
}: {
  description: string;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "w-full h-10 text-[11px] leading-[17px] font-medium text-600",
        className,
      )}
    >
      {description}
    </p>
  );
};

const CardButton = ({
  children,
  url,
  className,
}: {
  children: React.ReactNode;
  url?: string;
  className?: string;
}) => {
  return (
    <Link
      href={url || "#"}
      className={cn(
        "font-bold text-primary-accent border-stroke border-2 hover:text-primary-accent-dark hover:bg-primary-accent-lite py-2 px-3 rounded-lg",
        className,
      )}
    >
      {children}
    </Link>
  );
};

TreatmentCard.Image = CardImage;
TreatmentCard.Category = Category;
TreatmentCard.Labels = Labels;
TreatmentCard.Price = CardPrice;
TreatmentCard.Title = Title;
TreatmentCard.Description = Description;
TreatmentCard.Button = CardButton;
