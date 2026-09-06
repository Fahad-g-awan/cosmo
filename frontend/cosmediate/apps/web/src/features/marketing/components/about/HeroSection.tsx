"use client";

import Image from "next/image";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { useAboutPageData } from "../../hooks/useMarketingPageData";

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
            "w-full flex flex-row items-center justify-center gap-[80px] max-xl:gap-[50px] max-lg:gap-7 max-sm:gap-4",
            "max-lg:flex-col max-lg:pt-[40px] max-sm:pt-4 max-lg:px-0 max-sm:px-0"
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
  const { heroData } = useAboutPageData();
  const about = useTranslations("marketing").about;

  return (
    <div
      className={cn(
        "w-[50%] max-xl:w-[40%] lg:h-[500px] max-lg:w-full flex items-center justify-center lg:py-10"
      )}
    >
      <Image
        src={heroData.heroImage}
        alt={about.hero.heroImageAlt}
        width={500}
        height={500}
        quality={100}
        className={cn(
          "w-full h-full xl:w-[70%] object-cover rounded-2xl max-lg:rounded-none"
        )}
      />
    </div>
  );
};

const HeroTextSection = () => {
  const { heroData } = useAboutPageData();

  return (
    <div
      className={cn(
        "w-[50%] max-xl:w-[60%] max-lg:w-full flex flex-col items-center justify-center gap-6 max-sm:gap-4 max-sm:px-4"
      )}
    >
      <h1
        className={cn(
          "w-full text-start font-bold text-700 text-[26px] leading-[31.2px]",
          "max-lg:text-center max-sm:text-start max-sm:text-[18px]"
        )}
      >
        {heroData.tagline}
      </h1>

      <h1
        className={cn(
          "max-lg:w-[600px] max-sm:w-full text-700 font-bold text-[66px] leading-[79.2px] max-xl:text-[48px] max-xl:leading-[57px] max-sm:text-[30px] max-sm:leading-[36px] text-start max-sm:text-center max-lg:text-center"
        )}
      >
        {heroData.title}
      </h1>
    </div>
  );
};

export default HeroSection;
