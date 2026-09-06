import { useCallback } from "react";

import { Button, ButtonLoader, Toaster } from "@cosmediate/ui";
import {
  useFormIsDirty,
  useFormStore,
  useFormValidate,
} from "@cosmediate/form-core";
import { FormSection } from "@cosmediate/form-ui";
import { useAuth } from "@cosmediate/auth";

import { FormSingleImageUpload } from "@app/components/form/FormSingleImageUpload";

import { BlogFormProps, BlogFormValues } from "../../../types/blog.types";
import { PublishingSection } from "./PublishingSection";
import { ContentSection } from "./ContentSection";
import { TitleSection } from "./TitleSection";
import { TagsSection } from "./TagsSection";

export function BlogFormInner({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  isUpdate = false,
}: BlogFormProps) {
  const store = useFormStore<BlogFormValues>();
  const validate = useFormValidate();
  const isDirty = useFormIsDirty();
  const { session } = useAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!session?.tokens?.accessToken) {
        Toaster("Authentication required", "error");
        return;
      }

      if (!validate()) {
        Toaster("Please fix the validation errors", "error");
        return;
      }

      const values = store.getState().values;
      const payload: BlogFormValues = { ...values };

      if (payload.publishedAt) {
        payload.publishedAt = new Date(payload.publishedAt).toISOString();
      }

      await onSubmit(payload);
    },
    [validate, store, onSubmit, session?.tokens?.accessToken],
  );

  return (
    <form onSubmit={handleSubmit} className="w-full h-full space-y-8">
      <div className="w-full h-full grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-8">
        <div className="w-full sm:col-span-1">
          <div className="sticky top-4 space-y-4">
            <FormSection title="Blog Image">
              <div className="flex items-center gap-1 -mt-1 mb-1">
                <span className="text-xs text-500">Image is required</span>
                <span className="text-red-400 text-xs">*</span>
              </div>
              <FormSingleImageUpload
                path="blogImage"
                shape="rounded"
                helperText="Recommended: 800x600px, max 5MB"
                width={250}
                height={180}
                containerClassName="px-2"
                title=""
              />
            </FormSection>

            <FormSection title="Publishing">
              <PublishingSection
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
            </FormSection>
          </div>
        </div>

        <div className="w-full h-full col-span-2 max-xl:col-span-1 space-y-6">
          <TitleSection />
          <ContentSection initialContent={initialData?.content} />
          <TagsSection />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || (Boolean(isUpdate) && !isDirty)}
          className="min-w-[150px] max-sm:w-full"
        >
          {isSubmitting ? <ButtonLoader /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
