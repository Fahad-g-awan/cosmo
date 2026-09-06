import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import {
  CategoryFormProps,
  CategoryFormValues,
} from "../../../types/blogCategory.types";
import { defaultCategoryFormValues } from "../../../defaults/blogCategory.defaults";
import { CategoryFormSchema } from "../../../schemas/blogCategoryForm.schema";
import { CategoryFormInner } from "./CategoryFormInner";

export const CategoryForm = forwardRef<FormApiRef, CategoryFormProps>(
  function CategoryForm(
    { initialData, onSubmit, isSubmitting = false, submitLabel, mode = "single" },
    ref,
  ) {
    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultCategoryFormValues,
            names: initialData?.name
              ? [initialData.name]
              : defaultCategoryFormValues.names,
            published:
              initialData?.published ?? defaultCategoryFormValues.published,
          } as CategoryFormValues,
          schema: CategoryFormSchema,
        }),
      [initialData],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <CategoryFormInner
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          mode={mode}
        />
      </FormProvider>
    );
  },
);
