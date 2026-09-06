"use client";

import { useMemo } from "react";

import { useTranslations } from "@cosmediate/i18n/client";

import { useFilterOptions } from "@web/context/FilterOptionsContext";
import { buildClinicTreatmentsTabConfig } from "@web/features/Treatments/lib/config";
import { ProfileBrowseConfigSetter } from "@web/components/profile/ProfileBrowseTab";

const BROWSE_TABS = new Set(["treatments"]);

interface SpecialistProfileBrowseBridgeProps {
  specialistId?: string;
  activeTab: string;
}

export const SpecialistProfileBrowseBridge = ({
  specialistId,
  activeTab,
}: SpecialistProfileBrowseBridgeProps) => {
  const browse = useTranslations("browse");
  const { treatmentCategories, treatmentBrands, priceData } =
    useFilterOptions();

  const config = useMemo(() => {
    const scopeSuffix = BROWSE_TABS.has(activeTab) ? activeTab : "shell";
    const scope = specialistId
      ? `detail:specialists:${specialistId}:${scopeSuffix}`
      : "detail:specialists:shell";

    const baseConfig = buildClinicTreatmentsTabConfig({
      treatmentCategories,
      treatmentBrands,
      priceData,
      browse,
    });

    const syncToUrl = BROWSE_TABS.has(activeTab);

    return {
      ...baseConfig,
      filters: {
        ...baseConfig.filters,
        scope,
        syncToUrl,
      },
      preferences: {
        ...baseConfig.preferences,
        scope,
        syncToUrl,
      },
    };
  }, [
    activeTab,
    specialistId,
    treatmentCategories,
    treatmentBrands,
    priceData,
    browse,
  ]);

  return <ProfileBrowseConfigSetter config={config} />;
};
