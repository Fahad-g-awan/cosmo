"use client";

import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";

import { useVacanciesPageData } from "../../hooks/useMarketingPageData";

const HeaderSection = () => {
  const { headerData } = useVacanciesPageData();

  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-4",
        "max-sm:text-center "
      )}
    >
      <h1
        className={cn(
          "text-700 text-[42px] font-semibold leading-[50px] max-sm:text-[30px] max-sm:leading-[36px]"
        )}
      >
        {headerData.title}
      </h1>

      <p
        className={cn(
          "text-600 text-2xl leading-[36px] font-medium max-sm:text-xl max-sm:leading-[30px] "
        )}
      >
        {headerData.description}
      </p>

      <p
        className={cn(
          "text-primary-accent text-[27px] font-semibold leading-8 max-sm:text-xl max-sm:leading-6"
        )}
      >
        {headerData.tagLine}
      </p>
    </div>
  );
};

export default HeaderSection;
