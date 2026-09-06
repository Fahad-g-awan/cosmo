"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import type { BenefitItem } from "../BenefitCard";
import { BenefitCard } from "../BenefitCard";
import { usePartnerPageData } from "../../hooks/useMarketingPageData";

const BenefitsSection = () => {
  const { benefitsData } = usePartnerPageData();
  const shared = useTranslations("marketing").shared;

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-start gap-[80px] max-lg:gap-[40px] max-sm:gap-[32px]"
      )}
    >
      <div
        className={cn(
          "w-full grid grid-cols-3 max-lg:grid-cols-1 items-center justify-center max-sm:gap-10"
        )}
      >
        {benefitsData.slice(0, 3).map((benefit: BenefitItem, index: number) => (
          <BenefitCard key={index} benefit={benefit} />
        ))}
      </div>

      <div className="w-full flex flex-col items-center justify-start gap-[40px] max-lg:gap-[40px] max-sm:gap-[24px]">
        <div
          className={cn(
            "w-full text-[32px] leading-[38.4px] text-700 font-bold text-center",
            "max-sm:text-[20px] "
          )}
        >
          {shared.benefitsHeadingClinic}
        </div>

        <div
          className={cn(
            "w-full grid grid-cols-4 max-lg:grid-cols-1 items-start justify-center max-sm:gap-10"
          )}
        >
          {benefitsData.slice(-4).map((benefit: BenefitItem, index: number) => (
            <BenefitCard key={index} benefit={benefit} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;
