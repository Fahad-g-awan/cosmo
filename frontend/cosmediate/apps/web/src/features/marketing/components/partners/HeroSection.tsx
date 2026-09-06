"use client";

import Image from "next/image";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { usePartnerPageData } from "../../hooks/useMarketingPageData";

const HeroSection = () => {
  return (
    <div className={cn("w-full px-2 max-lg:px-0")}>
      <div
        className={cn(
          "w-full flex justify-center items-center",
          "rounded-t-2xl max-lg:rounded-t-none"
        )}
        style={{
          background:
            "linear-gradient(86.94deg, #FEE7E7 0%, #E7EFF7 49.5%, #E4DEFF 100%)",
        }}
      >
        <SiteContainer
          className={cn(
            "w-full flex flex-row items-center justify-center gap-8 max-lg:gap-7 max-sm:gap-4",
            "max-lg:flex-col max-lg:pt-[24px] max-sm:pt-4"
          )}
        >
          <HeroTextSection />
          <HeroImageSection />
        </SiteContainer>
      </div>
    </div>
  );
};

const HeroImageSection = () => {
  const { heroData } = usePartnerPageData();
  const hero = useTranslations("marketing").partnersClinics.hero;

  return (
    <div className={cn("w-[40%] max-sm:w-full pt-6 max-lg:pt-32 max-sm:pt-0")}>
      <Image
        src={heroData.image}
        alt={hero.imageAlt}
        width={500}
        height={500}
        quality={100}
        className="w-full lg:w-[80%] max-lg:-scale-x-100"
      />
    </div>
  );
};

const HeroTextSection = () => {
  const { heroData } = usePartnerPageData();

  return (
    <div
      className={cn(
        "w-[60%] max-sm:w-full flex flex-col gap-4",
        "max-lg:pb-16 max-lg:pt-4 max-sm:py-0"
      )}
    >
      <h1
        className={cn(
          "text-start font-bold text-700 text-[74px] leading-[88px] max-xl:text-[48px] max-xl:leading-[57px] max-sm:text-[30px] max-sm:leading-[36px] max-sm:text-center"
        )}
      >
        {heroData.title}
      </h1>
      <p
        className={cn(
          "lg:w-[80%] text-700 text-[20px] leading-[30px] text-start max-sm:text-sm max-sm:leading-[21px] max-sm:text-center"
        )}
      >
        {heroData.secondaryText}
      </p>
    </div>
  );
};

export default HeroSection;
