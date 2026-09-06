import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import {
  TreatmentResultFormProps,
  TreatmentResultFormValues,
} from "../../../types/treatmentResult.types";
import { defaultTreatmentResultFormValues } from "../../../defaults/treatmentResult.defaults";
import { TreatmentResultFormSchema } from "../../../schemas/treatmentResultForm.schema";
import { TreatmentResultFormInner } from "./TreatmentResultFormInner";

export const TreatmentResultForm = forwardRef<
  FormApiRef,
  TreatmentResultFormProps
>(function TreatmentResultForm(
  {
    initialData,
    onSubmit,
    isSubmitting = false,
    submitLabel,
    clinicGalleryMode = false,
  },
  ref,
) {
  const store = useMemo(
    () =>
      createFormStore({
        initialValues: {
          ...defaultTreatmentResultFormValues,
          ...initialData,
        } as TreatmentResultFormValues,
        schema: TreatmentResultFormSchema,
      }),
    [initialData],
  );

  useFormApiHandle(store, ref);

  return (
    <FormProvider store={store}>
      <TreatmentResultFormInner
        initialData={initialData}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        clinicGalleryMode={clinicGalleryMode}
      />
    </FormProvider>
  );
});
