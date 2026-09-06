"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import type { Item as BreadcrumbItemType } from "@cosmediate/ui";
import { Separator, MissionSection } from "@cosmediate/ui";
import { SiteContainer } from "@cosmediate/ui";
import { Breadcrumbs } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import PartnersContactUsSection from "../components/partners/ContactUsSection";
import PartnersBenefitSection from "../components/partners/BenefitsSection";
import PartnerHeroSection from "../components/partners/HeroSection";
import SubHeader from "@web/layout/SubHeader";

const Partners = () => {
  const nav = useTranslations("nav");
  const partners = useTranslations("marketing").partnersClinics;
  const breadcrumbData: BreadcrumbItemType[] = [
    { label: nav.home, path: "/home" },
    { label: partners.breadcrumb, path: "/partners" },
  ];

  return (
    <div
      className={cn("w-full flex flex-col items-center justify-start gap-2")}
    >
      <SubHeader>
        <Breadcrumbs items={breadcrumbData} />
        <SubHeader.Title>{partners.pageTitle}</SubHeader.Title>
      </SubHeader>

      <PartnerHeroSection />

      <SiteContainer
        className={cn(
          "w-full flex flex-col items-center justify-start gap-[86px] max-lg:gap-[32px] max-sm:gap-6 my-10 mb-14"
        )}
      >
        <PartnersBenefitSection />
        <PartnersContactUsSection />

        <Separator />
      </SiteContainer>

      <MissionSection />
    </div>
  );
};

export default Partners;
