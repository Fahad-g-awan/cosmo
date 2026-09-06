"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import FeatureCard from "./components/FeatureCard";
import { FEATURE_ITEMS } from "../../contants";

const FeaturesSection = () => {
  const features = useTranslations("marketing").home.features;

  return (
    <SiteContainer>
      <div
        className={cn(
          "w-full flex items-start gap-20 mt-16",
          "max-lg:flex-col max-lg:items-center max-lg:gap-16 max-sm:gap-12"
        )}
      >
        {FEATURE_ITEMS.map((item, index) => (
          <FeatureCard
            item={{
              ...item,
              ...features[index]!,
            }}
            key={item.id}
            index={index}
          />
        ))}
      </div>
    </SiteContainer>
  );
};

export default FeaturesSection;
