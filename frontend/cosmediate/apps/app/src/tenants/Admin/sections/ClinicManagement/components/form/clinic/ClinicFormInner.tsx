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

import { FormSingleImageUpload } from "@app/components/form/FormSingleImageUpload";
import { useClinicImageItems } from "@app/lib/clinic-image-upload";

import { ClinicFormProps, ClinicFormValues } from "../../../types/clinic.types";
import { ParentClinicSection } from "./ParentClinicSection";
import { CertificatesSection } from "./CertificatesSection";
import { WorkingHoursSection } from "./WorkingHoursSection";
import { ClinicTypeSection } from "./ClinicTypeSection";
import { BasicInfoSection } from "./BasicInfoSection";
import { CategorySection } from "./CategorySection";
import { ManagerSection } from "./ManagerSection";
import { ContentSection } from "./ContentSection";
import { TagsSection } from "./TagsSection";
import { FAQSection } from "./FaqSection";

export function ClinicFormInner({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  mode = "create",
}: ClinicFormProps) {
  const clinicType = useFormValue<string>("clinicType");
  const clinicImages = useFormValue<(string | File)[] | undefined>(
    "clinicImages",
  );
  const clinicImageItems = useClinicImageItems(clinicImages);
  const clinicImagesError = useFormError("clinicImages");
  const store = useFormStore<ClinicFormValues>();
  const setValue = useFormSetValue();
  const validate = useFormValidate();
  const isDirty = useFormIsDirty();

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
            <FormSection title="Clinic Images">
              <FormSingleImageUpload
                path="clinicLogo"
                shape="rounded"
                helperText="Recommended: 400x400px, max 2MB"
                maxSizeMB={2}
                width={250}
                height={180}
                containerClassName="px-2"
                title="Main Logo"
              />
              <ImageUpload
                multiple
                value={clinicImageItems}
                onChange={(items) => {
                  const next = items.map((item) => item.file ?? item.url);
                  setValue("clinicImages", next.length > 0 ? next : undefined);
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
                title="Gallery Images"
              />
              <FieldError error={clinicImagesError} />
            </FormSection>
          </div>
        </div>

        <div className="w-full h-full col-span-2 max-xl:col-span-1 space-y-6">
          <BasicInfoSection />
          <CategorySection
            categorySeed={initialData?.categories?.map((category) => ({
              value: category.id,
              label: category.name,
              searchText: category.name,
            }))}
          />
          <ClinicTypeSection mode={mode} />
          {clinicType === "NODE" && <ParentClinicSection />}
          <ManagerSection
            mode={mode}
            clinicId={initialData?.id}
            managerSeed={initialData?.managers?.flatMap((manager) => {
              if (!manager?.id) return [];
              return [
                {
                  value: manager.id,
                  label: `${manager.fullName || `${manager.firstName} ${manager.lastName}`} (${manager.email})`,
                  searchText: manager.fullName ?? manager.email,
                },
              ];
            })}
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
          disabled={isSubmitting || (mode === "update" && !isDirty)}
          className="min-w-37.5 max-sm:w-full"
        >
          {isSubmitting ? <ButtonLoader /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
