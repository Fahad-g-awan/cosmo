import { useCallback } from "react";

import { Button, ButtonLoader, Toaster } from "@cosmediate/ui";
import {
  useFormIsDirty,
  useFormStore,
  useFormValidate,
} from "@cosmediate/form-core";
import { FormSection } from "@cosmediate/form-ui";

import { FormSingleImageUpload } from "@app/components/form/FormSingleImageUpload";

import {
  TreatmentFormProps,
  TreatmentFormValues,
} from "../../../types/treatment.types";

import { PublishedSection } from "./PublishedSection";
import { BasicInfoSection } from "./BasicInfoSection";
import { DetailsSection } from "./DetailsSection";
import { ContentSection } from "./ContentSection";
import { TagsSection } from "./TagsSection";
import { FAQSection } from "./FaqSection";

export function TreatmentFormInner({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  isUpdate = false,
}: TreatmentFormProps) {
  const store = useFormStore<TreatmentFormValues>();
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
      <div className="w-full h-full grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-8">
        <div className="w-full sm:col-span-1">
          <div className="w-full sticky top-4 space-y-4">
            <FormSection title="Treatment Image">
              <div className="flex items-center gap-1 -mt-1 mb-1">
                <span className="text-xs text-500">Image is required</span>
                <span className="text-red-400 text-xs">*</span>
              </div>
              <FormSingleImageUpload
                path="treatmentImage"
                shape="rounded"
                helperText="Recommended: 800x600px, max 5MB"
                width={250}
                height={180}
                containerClassName="px-2"
                title=""
              />
            </FormSection>

            <PublishedSection />
          </div>
        </div>

        <div className="w-full h-full col-span-2 max-xl:col-span-1 space-y-6">
          <BasicInfoSection
            categorySeed={
              initialData?.categoryId && initialData?.categoryName
                ? [
                    {
                      value: initialData.categoryId,
                      label: initialData.categoryName,
                      searchText: initialData.categoryName,
                    },
                  ]
                : undefined
            }
          />
          <DetailsSection />
          <ContentSection initialContent={initialData?.htmlDescription} />
          <FAQSection initialFaqs={initialData?.faqs} />
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
