import { useEffect, useState } from "react";

import { listClinicTreatmentsApi } from "@cosmediate/api";
import {
  ControlledSelectField,
  ControlledTextareaField,
  FormSection,
} from "@cosmediate/form-ui";
import { useAuth } from "@cosmediate/auth";

import { useWorkspace } from "@app/context/WorkspaceContext";

import { ClinicTreatmentOffering } from "../../../types/treatment.types";

export const BasicInfoSection = ({
  clinicGalleryMode = false,
}: {
  clinicGalleryMode?: boolean;
}) => {
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [offerings, setOfferings] = useState<ClinicTreatmentOffering[]>([]);
  const { session } = useAuth();
  const { activeClinicId } = useWorkspace();
  const accessToken = session?.tokens?.accessToken;

  useEffect(() => {
    if (!accessToken || !activeClinicId || clinicGalleryMode) {
      setIsLoadingOfferings(false);
      return;
    }

    const fetchOfferings = async () => {
      try {
        setIsLoadingOfferings(true);
        const response = await listClinicTreatmentsApi(
          { clinicId: activeClinicId },
          accessToken,
        );
        if (response.success && response.items) {
          setOfferings(response.items);
        }
      } catch (error) {
        console.error("Error fetching clinic offerings:", error);
      } finally {
        setIsLoadingOfferings(false);
      }
    };
    void fetchOfferings();
  }, [accessToken, activeClinicId, clinicGalleryMode]);

  return (
    <FormSection title="Treatment Result Details" className="w-full space-y-4">
      <div className="w-full space-y-2">
        <ControlledTextareaField
          className="w-full max-lg:col-span-2"
          path="description"
          label="Description"
          required
        />
        <p className="text-xs text-500">
          A short summary that appears in treatment listings
        </p>
      </div>

      {!clinicGalleryMode && (
        <ControlledSelectField
          options={offerings.map((offering) => ({
            value: offering.id,
            label: offering.treatmentName,
          }))}
          label="Clinic treatment offering"
          path="clinicTreatmentId"
          placeholder={
            isLoadingOfferings ? "Loading..." : "Select clinic treatment offering"
          }
          disabled={isLoadingOfferings || !accessToken || !activeClinicId}
          required
        />
      )}
    </FormSection>
  );
};
