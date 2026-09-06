"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";

import { TreatmentResultsFormLoader } from "@cosmediate/ui";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";

import { ServiceDetailBackLink } from "./components/ServiceDetailBackLink";
import { ServiceDetailOverview } from "./components/ServiceDetailOverview";
import { useSpecialistServiceDetail } from "../../../hooks/treatments";
import { SubTreatmentsTable } from "./components/SubTreatmentsTable";
import { ResultsGallery } from "./components/ResultsGallery";

const SpecialistServiceDetail = () => {
  const params = useParams<{ clinicTreatmentId: string }>();
  const clinicTreatmentId = params.clinicTreatmentId;
  const router = useRouter();

  const { assignment, subTreatments, results, isLoading } =
    useSpecialistServiceDetail(clinicTreatmentId);

  useGatedPanelHeader(
    panelHeaderConfig.specialist.settings.treatments.serviceDetail,
    "treatment",
  );

  if (isLoading) {
    return <TreatmentResultsFormLoader />;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <ServiceDetailBackLink onBack={() => router.back()} />

      <ServiceDetailOverview assignment={assignment} />

      <section className="w-full flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-700">Sub-treatments</h2>
        <SubTreatmentsTable subTreatments={subTreatments} />
      </section>

      <section className="w-full flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-700">
          Before / after results
        </h2>
        <ResultsGallery results={results} />
      </section>
    </div>
  );
};

export default SpecialistServiceDetail;
