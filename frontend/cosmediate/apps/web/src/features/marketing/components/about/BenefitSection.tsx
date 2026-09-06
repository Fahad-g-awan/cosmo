"use client";

import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { BenefitCard, BenefitItem } from "../BenefitCard";
import { useAboutPageData } from "../../hooks/useMarketingPageData";

const AboutBenefitSection = () => {
  const { benefitsData } = useAboutPageData();

  return (
    <div
      className={cn(
        "container flex flex-col items-center justify-start gap-[86px]"
      )}
    >
      <div
        className={cn(
          "w-full max-lg:w-full flex items-start justify-center max-lg:flex-col gap-[120px] max-lg:gap-6"
        )}
      >
        {benefitsData.map((benefit: BenefitItem, index: number) => (
          <BenefitCard key={index} benefit={benefit} />
        ))}
      </div>
    </div>
  );
};

export default AboutBenefitSection;
