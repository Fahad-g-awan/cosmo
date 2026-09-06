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
  { initialData, onSubmit, isSubmitting = false, submitLabel, isUpdate },
  ref,
) {
  const store = useMemo(
    () =>
      createFormStore({
        initialValues: {
          ...defaultTreatmentResultFormValues,
          ...initialData,
          treatmentId: initialData?.treatmentId ?? "",
          description: initialData?.description ?? "",
          beforeImage: initialData?.beforeImage || undefined,
          afterImage: initialData?.afterImage || undefined,
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
        isUpdate={isUpdate}
      />
    </FormProvider>
  );
});
