import { useCallback, useMemo } from "react";

import { Button, ButtonLoader, Toaster } from "@cosmediate/ui";
import {
  useFormIsDirty,
  useFormStore,
  useFormValidate,
} from "@cosmediate/form-core";
import { FormSection } from "@cosmediate/form-ui";

import { FormSingleImageUpload } from "@app/components/form/FormSingleImageUpload";

import {
  SpecialistFormProps,
  SpecialistFormValues,
} from "../../../types/specialist.types";
import { PermissionsGrantField } from "@app/components/permissions/PermissionsGrantField";
import { ParentClinicSection } from "@app/components/form/specialist/ParentClinicSection";
import { CertificatesSection } from "./CertificatesSection";
import { WorkingHoursSection } from "./WorkingHoursSection";
import { WorkingTypeSection } from "./WorkingTypeSection";
import { BasicInfoSection } from "./BasicInfoSection";
import { ContentSection } from "./ContentSection";
import { TagsSection } from "./TagsSection";
import { FAQSection } from "./FaqSection";

export function SpecialistFormInner({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  isUpdate = false,
  clinicDashboard = false,
}: SpecialistFormProps) {
  const store = useFormStore<SpecialistFormValues>();
  const validate = useFormValidate();
  const isDirty = useFormIsDirty();

  const clinicSeed = useMemo(
    () =>
      initialData?.clinics?.map((clinic) => ({
        value: clinic.id,
        label: `${clinic.name}${clinic.completeAddress ? ` - ${clinic.completeAddress}` : ""}`,
        searchText: `${clinic.name} ${clinic.completeAddress ?? ""} ${clinic.city ?? ""}`,
      })),
    [initialData?.clinics],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        console.log("validation errors", store.getState().errors);
        Toaster("Please fix the validation errors", "error");
        return;
      }

      const values = store.getState().values;
      await onSubmit(values);
    },
    [validate, store, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-full h-full grid grid-cols-3 max-xl:grid-cols-1 gap-8">
        <div className="w-full sm:col-span-1">
          <div className="w-full sticky top-4 space-y-4">
            <FormSection title="Specialist Image">
              <FormSingleImageUpload
                path="specialistImage"
                shape="rounded"
                helperText="Recommended: 400x400px, max 2MB"
                maxSizeMB={2}
                width={250}
                height={180}
                containerClassName="px-2"
              />
            </FormSection>
            <PermissionsGrantField targetRole="SPECIALIST" />
          </div>
        </div>

        <div className="w-full h-full col-span-2 max-xl:col-span-1 space-y-6">
          <BasicInfoSection isUpdate={isUpdate} />
          <WorkingTypeSection
            isUpdate={isUpdate}
            clinicDashboard={clinicDashboard}
          />
          <ParentClinicSection
            clinicSeed={clinicSeed}
            isUpdate={isUpdate}
            clinicDashboard={clinicDashboard}
          />
          <ContentSection initialContent={initialData?.htmlAbout} />
          <WorkingHoursSection />
          <CertificatesSection />
          <FAQSection initialFaqs={initialData?.faqs || []} />
          <TagsSection />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || (Boolean(isUpdate) && !isDirty)}
          className="min-w-37.5 max-sm:w-full"
        >
          {isSubmitting ? <ButtonLoader /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
