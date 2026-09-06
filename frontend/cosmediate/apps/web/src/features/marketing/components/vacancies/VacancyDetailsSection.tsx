"use client";

import Image from "next/image";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { useVacanciesPageData } from "../../hooks/useMarketingPageData";

const VacancyDetailsSection = () => {
  const { vacancyDetailsData } = useVacanciesPageData();
  const shared = useTranslations("marketing").shared;

  return (
    <div
      className={cn(
        "w-full bg-ghost-blue flex flex-col items-start max-lg:items-center max-sm:items-start justify-center gap-4 rounded-2xl",
        "px-14 py-16 max-sm:px-4 max-sm:py-4"
      )}
    >
      <Image
        src={vacancyDetailsData.image}
        alt={shared.benefitImageAlt}
        quality={100}
        height={80}
        width={80}
      />

      <h1
        className={cn(
          "w-full font-bold text-700 text-[32px] leading-[38px] max-sm:leading-[28px] max-sm:text-[24px]"
        )}
      >
        {vacancyDetailsData.title}
      </h1>

      <h2 className="text-2xl leading-9 text-700 max-sm:text-[20px] max-sm:leading-[30px]">
        {vacancyDetailsData.secondaryTitle}
      </h2>

      <div
        className={cn(
          "w-full flex flex-col items-start max-lg:items-center max-sm:items-start justify-start gap-4"
        )}
      >
        {vacancyDetailsData.description.map((desc: string, index: number) => (
          <p key={index} className="w-full text-sm leading-[21px] text-900">
            {desc}
          </p>
        ))}
      </div>
    </div>
  );
};

export default VacancyDetailsSection;
