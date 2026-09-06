"use client";

import Image from "next/image";
import React from "react";

import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { MapPin, Star } from "lucide-react";
import { FaRegComments } from "react-icons/fa";

const SubHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center bg-gradient-to-tl from-[#F2F5FF] via-[#F6F8FF] to-[#F2F5FF]"
      )}
    >
      <SiteContainer>
        <div
          className={cn(
            "w-full container py-6.5 flex flex-col justify-center items-center gap-6 ",
            "max-lg:gap-4 max-sm:gap-2",
            className
          )}
        >
          {children}
        </div>
      </SiteContainer>
    </div>
  );
};

const Title = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "container capitalize w-full text-[30px] text-900 leading-9 font-bold text-wrap ",
        "max-sm:text-[20px] max-sm:leading-[24px]"
      )}
    >
      {children}
    </div>
  );
};

const EntityImage = ({
  containerClassName,
  imageClassName,
  src,
  alt,
}: {
  containerClassName: string;
  imageClassName: string;
  src: string;
  alt: string;
}) => {
  return (
    <div
      className={cn(
        "w-33.75 flex items-center justify-start",
        containerClassName
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={200}
        height={200}
        className={cn("w-full h-full object-cover", imageClassName)}
      />
    </div>
  );
};

const EntityName = ({
  name,
  className,
}: {
  name: string;
  className: string;
}) => {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-start",
        "max-lg:justify-center",
        "capitalize text-3xl leading-[36px] font-bold text-900",
        "max-sm:text-xl max-sm:leading-[24px]",
        className
      )}
    >
      {name}
    </div>
  );
};

const EntityRating = ({
  rating,
  reviewCount,
}: {
  rating: string;
  reviewCount: string;
}) => {
  return (
    <div className={cn("w-fit flex items-center justify-start gap-6")}>
      <div className={cn("flex items-center justify-center gap-1")}>
        <Star size={20} className={cn("text-blue-500 opacity-70")} />
        <span className={cn("text-[14px] leading-[21px] font-medium text-500")}>
          {rating}
        </span>
      </div>

      <div className={cn("flex items-center justify-center gap-1")}>
        <FaRegComments size={20} className={cn("text-yellow-500 opacity-70")} />
        <span className={cn("text-[14px] leading-[21px] font-medium text-500")}>
          {reviewCount}
        </span>
      </div>
    </div>
  );
};

const SpecialistAddress = ({ address }: { address: string }) => {
  return (
    <div
      className={cn(
        "w-fit flex items-center justify-start",
        "max-sm:justify-center max-sm:flex-col"
      )}
    >
      <div
        className={cn(
          "w-[285px] flex items-center justify-start",
          "text-sm font-medium text-500 leading-[21px]",
          "max-lg:justify-center"
        )}
      >
        Cosmetic specialist at:
      </div>

      <div
        className={cn(
          "w-full flex items-center justify-start",
          "max-lg:justify-center",
          "text-sm text-700 leading-[21px]",
          "max-sm:text-[11px] max-sm:leading-[17px] tracking-tight"
        )}
      >
        {address}
      </div>
    </div>
  );
};

const ClinicAddress = ({ address }: { address: string }) => {
  return (
    <div
      className={cn(
        "w-fit flex items-center justify-start gap-2",
        "max-lg:justify-center",
        "text-sm text-500 leading-[21px]",
        "max-sm:text-[11px] max-sm:leading-[17px] tracking-tight"
      )}
    >
      <MapPin size={20} className={cn("size-4")} />
      <span>{address}</span>
    </div>
  );
};

const HeaderContentContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-start",
        "max-lg:flex-col max-lg:items-center max-lg:justify-center",
        "gap-8 max-lg:gap-4"
      )}
    >
      {children}
    </div>
  );
};

SubHeader.Title = Title;
SubHeader.HeaderContentContainer = HeaderContentContainer;
SubHeader.EntityImage = EntityImage;
SubHeader.EntityName = EntityName;
SubHeader.EntityRating = EntityRating;
SubHeader.SpecialistAddress = SpecialistAddress;
SubHeader.ClinicAddress = ClinicAddress;

export default SubHeader;

export {
  Title as SubHeaderTitle,
  HeaderContentContainer as SubHeaderContentContainer,
  EntityImage as SubHeaderEntityImage,
  EntityName as SubHeaderEntityName,
  EntityRating as SubHeaderEntityRating,
  SpecialistAddress as SubHeaderSpecialistAddress,
  ClinicAddress as SubHeaderClinicAddress,
};
