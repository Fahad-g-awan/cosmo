import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import { BrandFormProps, BrandFormValues } from "../../../types/brand.types";
import { defaultBrandFormValues } from "../../../defaults/brand.defaults";
import { BrandFormSchema } from "../../../schemas/brandForm.schema";
import { BrandFormInner } from "./BrandFormInner";

export const BrandForm = forwardRef<FormApiRef, BrandFormProps>(function BrandForm(
  { initialData, onSubmit, isSubmitting = false, submitLabel, mode = "single" },
  ref,
) {
  const store = useMemo(
    () =>
      createFormStore({
        initialValues: {
          ...defaultBrandFormValues,
          names: initialData?.name
            ? [initialData.name]
            : defaultBrandFormValues.names,
          published: initialData?.published ?? defaultBrandFormValues.published,
        } as BrandFormValues,
        schema: BrandFormSchema,
      }),
    [initialData],
  );

  useFormApiHandle(store, ref);

  return (
    <FormProvider store={store}>
      <BrandFormInner
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        mode={mode}
      />
    </FormProvider>
  );
});
