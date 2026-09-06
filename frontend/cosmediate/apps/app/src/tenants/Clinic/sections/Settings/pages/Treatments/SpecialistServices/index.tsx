"use client";

import React from "react";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";

import ManageTreatmentsLayout from "../../../components/treatments/TreatmentsManagementLayout";
import { useSpecialistServices } from "../../../hooks/treatments";
import { ServicesCardGrid } from "./components/ServicesCardGrid";

const SERVICES_BASE = "/settings/treatments-management/services";

const SpecialistServices = () => {
  const {
    serviceCategories,
    activeCategory,
    setActiveCategory,
    displayedAssignments,
    isLoading,
  } = useSpecialistServices();

  useGatedPanelHeader(
    panelHeaderConfig.specialist.settings.treatments.services,
    "treatment",
  );

  const hasCategories = serviceCategories.length > 0;

  return (
    <ManageTreatmentsLayout
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      categories={serviceCategories}
      sectionTitle="Services"
      sectionDecription="Treatments assigned to you at the active clinic (read-only)."
      isLoading={isLoading && !hasCategories}
      showNoDataFound={!isLoading && !hasCategories}
    >
      <ServicesCardGrid
        items={displayedAssignments}
        getServiceHref={(clinicTreatmentId) =>
          `${SERVICES_BASE}/${clinicTreatmentId}`
        }
      />
    </ManageTreatmentsLayout>
  );
};

export default SpecialistServices;
