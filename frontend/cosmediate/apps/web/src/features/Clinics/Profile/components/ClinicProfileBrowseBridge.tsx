"use client";

import { useMemo } from "react";

import { useTranslations } from "@cosmediate/i18n/client";

import { buildClinicTreatmentsTabConfig } from "@web/features/Treatments/lib/config";
import { ProfileBrowseConfigSetter } from "@web/components/profile/ProfileBrowseTab";
import { buildClinicDoctorsTabConfig } from "@web/features/Specialists/lib/config";
import { useFilterOptions } from "@web/context/FilterOptionsContext";

const BROWSE_TABS = new Set(["treatments", "doctors"]);

interface ClinicProfileBrowseBridgeProps {
  clinicId?: string;
  activeTab: string;
}

export const ClinicProfileBrowseBridge = ({
  clinicId,
  activeTab,
}: ClinicProfileBrowseBridgeProps) => {
  const browse = useTranslations("browse");
  const { treatmentCategories, treatmentBrands, priceData } =
    useFilterOptions();

  const config = useMemo(() => {
    const browseTab = BROWSE_TABS.has(activeTab) ? activeTab : "treatments";
    const scopeSuffix = BROWSE_TABS.has(activeTab) ? activeTab : "shell";
    const scope = clinicId
      ? `detail:clinics:${clinicId}:${scopeSuffix}`
      : "detail:clinics:shell";

    const baseConfig =
      browseTab === "doctors"
        ? buildClinicDoctorsTabConfig({
            treatmentCategories,
            treatmentBrands,
            priceData,
            browse,
          })
        : buildClinicTreatmentsTabConfig({
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
    clinicId,
    treatmentCategories,
    treatmentBrands,
    priceData,
    browse,
  ]);

  return <ProfileBrowseConfigSetter config={config} />;
};
