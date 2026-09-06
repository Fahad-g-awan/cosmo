import { useCallback } from "react";

import {
  Button,
  ButtonLoader,
  Toaster,
} from "@cosmediate/ui";
import {
  useFormIsDirty,
  useFormStore,
  useFormValidate,
} from "@cosmediate/form-core";

import { FormSingleImageUpload } from "@app/components/form/FormSingleImageUpload";

import {
  TreatmentResultFormProps,
  TreatmentResultFormValues,
} from "../../../types/treatmentResult.types";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { FormGrid, FormSection } from "@cosmediate/form-ui";

import { BasicInfoSection } from "./BasicInfoSection";

export function TreatmentResultFormInner({
  onSubmit,
  isSubmitting,
  submitLabel,
  clinicGalleryMode = false,
}: TreatmentResultFormProps) {
  const store = useFormStore<TreatmentResultFormValues>();
  const validate = useFormValidate();
  const isDirty = useFormIsDirty();
  const { isMobileView, isTabletView, isXLScreen } = useWindowWidth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        Toaster("Please fix the validation errors", "error");
        return;
      }

      const values = store.getState().values;
      await onSubmit(values);
    },
    [validate, store, onSubmit]
  );

  const imageWidth = isXLScreen
    ? 250
    : isTabletView
      ? 280
      : isMobileView
        ? 250
        : 300;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-full flex flex-col items-center justify-start gap-5">
        <div className="w-full">
          <FormSection title="Upload Treatment Result Images">
            <FormGrid columns={2}>
              <FormSingleImageUpload
                path="beforeImage"
                shape="rounded"
                helperText="Recommended: 1200×800px (3:2), max 5MB"
                width={imageWidth}
                height={280}
                containerClassName="px-2"
                title="Before Image"
              />
              <FormSingleImageUpload
                path="afterImage"
                shape="rounded"
                helperText="Recommended: 1200×800px (3:2), max 5MB"
                width={imageWidth}
                height={280}
                containerClassName="px-2"
                title="After Image"
              />
            </FormGrid>
          </FormSection>
        </div>

        <BasicInfoSection clinicGalleryMode={clinicGalleryMode} />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="min-w-37.5 max-sm:w-full"
        >
          {isSubmitting ? <ButtonLoader /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
