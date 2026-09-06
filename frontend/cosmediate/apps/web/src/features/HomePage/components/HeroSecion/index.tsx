"use client";

import Image from "next/image";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { HERO_ITEM_ICONS } from "../../contants";
import SearchCard from "./SearchCard";

const HeroSection = () => {
  return (
    <div className={cn("w-full flex items-center justify-center lg:px-2")}>
      <div
        className={cn(
          "w-full hero-gradient flex items-start justify-center",
          "lg:rounded-t-2xl"
        )}
      >
        <SiteContainer
          className={cn(
            "w-full max-sm:max-w-none flex lg:flex-row items-center justify-center",
            "max-lg:py-8 max-sm:px-0 max-sm:pt-12 max-sm:pb-0"
          )}
        >
          <HeroLeftSection className="w-[30%] max-lg:w-full" />
          <HeroRightSection className="w-[70%] max-lg:w-full" />
        </SiteContainer>
      </div>
    </div>
  );
};

const HeroImage = ({ className }: { className?: string }) => {
  const home = useTranslations("marketing").home;

  return (
    <div className={cn("relative p-8 max-lg:p-6 max-sm:hidden", className)}>
      <Image
        src="/home/hero/hero-section-image.svg"
        alt={home.hero.heroImageAlt}
        width={500}
        height={500}
        className={cn("w-full rounded-[19px] pointer-events-none")}
      />
    </div>
  );
};

const HeroLeftSection = ({ className }: { className?: string }) => {
  const home = useTranslations("marketing").home;

  return (
    <div
      className={cn(
        "max-sm:container flex items-center justify-center pointer-events-none select-none",
        className
      )}
    >
      <div
        className={cn(
          "w-full flex flex-col items-start justify-start",
          "max-xl:px-6"
        )}
      >
        <div className={cn("w-full flex flex-col items-start justify-start")}>
          <div
            className={cn(
              "w-full text-900 font-bold text-6xl leading-16 max-xl:text-4xl max-xl:leading-9 max-lg:text-4xl max-lg:leading-10 max-sm:text-3xl max-sm:leading-9 max-sm:text-center",
              "mb-[20px] max-sm:mb-[8px]"
            )}
          >
            {home.hero.title}
          </div>
          <div
            className={cn(
              "w-full text-700 leading-[27px] font-medium mb-[36px]",
              "text-[18px] max-xl:text-[16px] max-sm:text-[14px] max-sm:leading-[21px] max-sm:text-center"
            )}
          >
            {home.hero.subtitle}
          </div>
        </div>

        <div
          className={cn(
            "w-full flex flex-col items-start justify-center gap-5 max-sm:items-center"
          )}
        >
          {HERO_ITEM_ICONS.map((item, index) => (
            <div
              key={item.id}
              className="w-full flex items-center justify-start gap-3"
            >
              <Image
                className="h-[28px] w-[28px] max-xl:w-[20px] max-xl:h-[20px]"
                src={item.icon}
                alt={home.hero.items[index] ?? ""}
                width={100}
                height={100}
              />
              <span className={cn("text-black text-[14px] leading-[18px]")}>
                {home.hero.items[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <HeroImage className="w-full lg:hidden" />
    </div>
  );
};

const HeroRightSection = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "lg:relative max-lg:mt-8 flex items-start justify-start",
        className
      )}
    >
      <HeroImage className="w-[65%] max-lg:hidden" />

      <div
        className={cn(
          "lg:absolute xl:top-30 xl:right-3 lg:top-25 lg:-right-5",
          "2xl:w-[500px] w-[450px] max-xl:w-[350px] max-lg:w-full"
        )}
      >
        <SearchCard />
      </div>
    </div>
  );
};

export default HeroSection;
