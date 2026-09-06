"use client";

import Image from "next/image";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { useVacanciesPageData } from "../../hooks/useMarketingPageData";

export interface VacancyRequirement {
  title: string;
  image?: string;
  lists: List[];
  description: string;
}

export interface List {
  image: string;
  description: string;
}

const VacancyRequirements = () => {
  const { vacancyRequirementsData } = useVacanciesPageData();
  const shared = useTranslations("marketing").shared;

  return (
    <div
      className={cn(
        "w-full grid grid-cols-2 max-lg:grid-cols-1 items-start justify-start gap-8 max-lg:gap-6 max-sm:gap-4"
      )}
    >
      {vacancyRequirementsData.map(
        (requirement: VacancyRequirement, index: number) => (
          <SectionContent
            key={index}
            requirement={requirement}
            imageAlt={shared.benefitImageAlt}
          />
        )
      )}
    </div>
  );
};

const SectionContent = ({
  requirement,
  imageAlt,
}: {
  requirement: VacancyRequirement;
  imageAlt: string;
}) => {
  return (
    <div
      className={cn(
        "w-full bg-ghost-blue flex flex-col items-start justify-center gap-6 rounded-2xl",
        "px-14 py-16 max-sm:px-4 max-sm:py-4"
      )}
    >
      <h1
        className={cn(
          "w-full text-start text-700 font-bold text-[32px] leading-[38px] max-sm:text-[24px] max-sm:leading-[28px]"
        )}
      >
        {requirement.title}
      </h1>

      <ul
        className={cn("w-full flex flex-col items-start justify-start gap-6")}
      >
        {requirement.lists.map((list: List, index: number) => (
          <li
            key={index}
            className={cn("w-full flex items-center justify-start gap-2")}
          >
            <Image
              src={list.image}
              alt={imageAlt}
              width={32}
              height={32}
              quality={100}
              className="w-auto h-auto"
            />
            <p className="text-sm leading-[21px] font-medium text-900">
              {list.description}
            </p>
          </li>
        ))}
      </ul>

      <p className="w-full text-base leading-6 text-700">
        {requirement.description}
      </p>
    </div>
  );
};

export default VacancyRequirements;
