"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import type { Item as BreadcrumbItemType } from "@cosmediate/ui";
import { SiteContainer, Breadcrumbs } from "@cosmediate/ui";
import { Separator, MissionSection } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import AboutMissionSection from "../components/about/AboutMissionSection";
import AboutBenefitSection from "../components/about/BenefitSection";
import AboutHeroSection from "../components/about/HeroSection";
import SubHeader from "@web/layout/SubHeader";

const About = () => {
  const nav = useTranslations("nav");
  const about = useTranslations("marketing").about;
  const breadcrumbData: BreadcrumbItemType[] = [
    { label: nav.home, path: "/home" },
    { label: about.breadcrumb, path: "/about" },
  ];

  return (
    <div
      className={cn("w-full flex flex-col items-center justify-start gap-2")}
    >
      <SubHeader>
        <Breadcrumbs items={breadcrumbData} />
        <SubHeader.Title>{about.pageTitle}</SubHeader.Title>
      </SubHeader>

      <AboutHeroSection />

      <SiteContainer
        className={cn(
          "w-full flex flex-col items-center justify-start gap-[86px] max-lg:gap-[32px] max-sm:gap-6 my-10 mb-14"
        )}
      >
        <AboutBenefitSection />
        <AboutMissionSection />

        <Separator />
      </SiteContainer>

      <MissionSection />
    </div>
  );
};

export default About;
