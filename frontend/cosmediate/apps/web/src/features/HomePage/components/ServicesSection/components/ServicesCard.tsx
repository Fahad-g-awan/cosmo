"use client";

import Image from "next/image";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { SERVICE_ICONS } from "../../../contants";

const ServicesCard = () => {
  const cards = useTranslations("marketing").home.services.cards;

  return (
    <div
      className={cn(
        "w-[81.6%] mx-auto bg-white rounded-2xl relative z-30",
        "-mt-22 max-lg:-mt-20 max-sm:-mt-14",
        "py-14 px-14 max-lg:py-10 max-lg:px-6",
        "max-sm:w-full max-sm:rounded-none"
      )}
    >
      <div
        className={cn(
          "w-full flex justify-between items-start gap-10",
          "max-lg:gap-6 max-sm:flex-col max-sm:items-center max-sm:gap-10"
        )}
      >
        {SERVICE_ICONS.map((item, index) => {
          const card = cards[index]!;
          return (
            <ServiceCard
              key={item.id}
              subDescription={card.subDescription}
              description={card.description}
              title={card.title}
              src={item.src}
            />
          );
        })}
      </div>
    </div>
  );
};

interface ServiceCardProps {
  subDescription: string;
  description: string;
  title: string;
  src: string;
}

const ServiceCard = ({
  subDescription,
  description,
  title,
  src,
}: ServiceCardProps) => {
  return (
    <div className="w-[290px] flex flex-col items-center justify-center gap-2 text-center">
      <Image
        src={src}
        alt={title}
        height={100}
        width={100}
        className="w-12 h-12 max-lg:w-[32px] mb-[6px] max-lg:h-[32px] "
      />

      <h3
        className={cn(
          "text-[34px] leading-[41px] text-800 font-bold",
          "max-lg:text-[20px] max-lg:leading-[27.21px]"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "text-[18px] leading-[22px] font-bold text-700 max-lg:text-[12px] max-lg:leading-[14.6px]"
        )}
      >
        {description}
      </p>

      <p
        className={cn(
          "leading-[16.8px] text-[12px] font-medium text-600",
          "max-sm:text-[11px] max-sm:leading-[15.6px] max-sm:px-10"
        )}
      >
        {subDescription}
      </p>
    </div>
  );
};

export default ServicesCard;
