import { useCallback } from "react";

import {
  Button,
  ButtonLoader,
  ImageUpload,
  ImageUploadError,
  Toaster,
} from "@cosmediate/ui";
import {
  useFormError,
  useFormIsDirty,
  useFormSetValue,
  useFormStore,
  useFormValidate,
  useFormValue,
} from "@cosmediate/form-core";
import { FieldError, FormSection } from "@cosmediate/form-ui";
import { useAuth } from "@cosmediate/auth/index";

import { FormSingleImageUpload } from "@app/components/form/FormSingleImageUpload";
import { useClinicImageItems } from "@app/lib/clinic-image-upload";

import { AvailabilitySection } from "../../../../components/clinicSetup/AvailabilitySection";
import { ClinicTypeSection } from "../../../../components/clinicSetup/ClinicTypeSection";
import { BasicInfoSection } from "../../../../components/clinicSetup/BasicInfoSection";
import { CategorySection } from "../../../../components/clinicSetup/CategorySection";
import { ContentSection } from "../../../../components/clinicSetup/ContentSection";
import {
  ClinicFormProps,
  ClinicFormValues,
} from "../../../../types/clinic.types";

export function ClinicFormInner({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: ClinicFormProps) {
  const { userRole } = useAuth();
  const isSpecialist = userRole === "SPECIALIST";

  const store = useFormStore<ClinicFormValues>();
  const setValue = useFormSetValue();
  const validate = useFormValidate();
  const isDirty = useFormIsDirty();

  const clinicImages = useFormValue<(string | File)[] | undefined>(
    "clinicImages",
  );
  const clinicImageItems = useClinicImageItems(clinicImages);
  const clinicImagesError = useFormError("clinicImages");

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
    [validate, store, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="w-full h-full grid grid-cols-3 max-xl:grid-cols-1 gap-8">
        <div className="w-full sm:col-span-1">
          <div className="w-full sticky top-4 space-y-4">
            <FormSection title={isSpecialist ? "Profile Image" : "Clinic Images"}>
              <FormSingleImageUpload
                path={isSpecialist ? "specialistImage" : "clinicLogo"}
                shape="rounded"
                helperText="Recommended: 400x400px, max 2MB"
                maxSizeMB={2}
                width={250}
                height={180}
                containerClassName="px-2"
                title={isSpecialist ? "Profile Photo" : "Main Logo"}
              />
              {!isSpecialist && (
                <>
                  <ImageUpload
                    multiple
                    value={clinicImageItems}
                    onChange={(items) => {
                      const next = items.map((item) => item.file ?? item.url);
                      setValue(
                        "clinicImages",
                        next.length > 0 ? next : undefined,
                      );
                    }}
                    onError={(error: ImageUploadError) =>
                      Toaster("Upload failed", "error", error.message)
                    }
                    shape="rounded"
                    helperText="Recommended: 400x400px, max 2MB, max 10 files"
                    maxFiles={10}
                    maxSizeMB={2}
                    width={80}
                    height={80}
                    containerClassName="px-2"
                    title="Multiple Images"
                  />
                  <FieldError error={clinicImagesError} />
                </>
              )}
            </FormSection>
          </div>
        </div>

        <div className="w-full h-full col-span-2 max-xl:col-span-1 space-y-6">
          {isSpecialist ? <AvailabilitySection /> : <ClinicTypeSection />}
          <BasicInfoSection />
          {!isSpecialist && (
            <CategorySection
              categorySeed={
                (initialData as { categories?: { id: string; name: string }[] })
                  ?.categories?.map((category) => ({
                    value: category.id,
                    label: category.name,
                    searchText: category.name,
                  })) ?? []
              }
            />
          )}
          <ContentSection initialContent={initialData?.htmlAbout} />
        </div>
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
