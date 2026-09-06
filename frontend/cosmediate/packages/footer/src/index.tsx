"use client";

import React from "react";

import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import SocialMediaLinks from "./components/SocialMediaLinks";
import TreatmentsLinks from "./components/TreatmentsLinks";
import KnowledgeLinks from "./components/KnowledgeLinks";
import PartnersLinks from "./components/PartnersLinks";
import BrandSection from "./components/BrandSection";
import AboutLinks from "./components/AboutLinks";
import useFooter from "./hooks/useFooter";

export const Footer: React.FC = () => {
  const { showFooter } = useFooter();

  if (!showFooter) return null;

  return (
    <footer className={cn("w-full bg-white p-[8px]", "max-lg:p-0")}>
      <div
        className={cn(
          "bg-900 w-full text-white flex items-center justify-center",
          "rounded-2xl max-lg:rounded-none"
        )}
      >
        <SiteContainer className="py-[65px] max-lg:py-[32px] max-sm:py-4">
          <div
            className={cn(
              "w-full grid grid-cols-[1fr_400px_1fr_100px] max-xl:grid-cols-[200px_1fr_100px_100px] max-sm:grid-cols-2 items-start justify-center gap-24 max-xl:gap-15 max-lg:gap-8"
            )}
          >
            <BrandSection className="max-sm:col-span-2" />
            <TreatmentsLinks className="max-sm:col-span-2" />

            <div className="flex flex-col gap-14 max-lg:gap-8 max-sm:gap-6">
              <KnowledgeLinks />
              <PartnersLinks />
            </div>

            <div className="flex flex-col gap-14 max-lg:gap-8 max-sm:gap-6">
              <AboutLinks />
              <SocialMediaLinks className="max-sm:hidden" />
            </div>
          </div>
        </SiteContainer>
      </div>
    </footer>
  );
};
