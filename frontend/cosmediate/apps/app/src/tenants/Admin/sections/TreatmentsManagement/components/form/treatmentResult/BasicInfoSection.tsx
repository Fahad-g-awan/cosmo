import { useMemo } from "react";

import { ControlledTextareaField, FormSection } from "@cosmediate/form-ui";
import { useAuth } from "@cosmediate/auth";

import {
  ControlledPaginatedAsyncSelectField,
  type PaginatedAsyncOption,
} from "@app/modules/PaginatedAsyncSelect";
import { useTreatmentFormFetcher } from "@app/lib/filters";
import { RESULT_DESCRIPTION_MAX_LENGTH } from "../../../schemas/treatmentResultForm.schema";

type BasicInfoSectionProps = {
  treatmentSeed?: PaginatedAsyncOption[];
};

export const BasicInfoSection = ({ treatmentSeed }: BasicInfoSectionProps) => {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const fetchTreatments = useTreatmentFormFetcher();

  const seedOptions = useMemo(
    () => (treatmentSeed?.length ? treatmentSeed : undefined),
    [treatmentSeed],
  );

  return (
    <FormSection title="Treatment Result Details" className="w-full space-y-4">
      <div className="w-full space-y-2">
        <ControlledTextareaField
          className="w-full max-lg:col-span-2"
          path="description"
          label="Description"
          required
          maxLength={RESULT_DESCRIPTION_MAX_LENGTH}
        />
        <p className="text-xs text-500">
          A short summary of the result. Max {RESULT_DESCRIPTION_MAX_LENGTH}{" "}
          characters.
        </p>
      </div>

      <ControlledPaginatedAsyncSelectField
        path="treatmentId"
        label="Treatment"
        placeholder="Select treatment"
        searchPlaceholder="Search treatments..."
        fetchPage={fetchTreatments}
        reloadKey={accessToken ?? "no-token"}
        enabled={Boolean(accessToken)}
        disabled={!accessToken}
        seedOptions={seedOptions}
        required
      />
    </FormSection>
  );
};
