import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import {
  TreatmentFormProps,
  TreatmentFormValues,
} from "../../../types/treatment.types";
import { defaultTreatmentFormValues } from "../../../defaults/treatment.default";
import { TreatmentFormSchema } from "../../../schemas/treatmentForm.schema";
import { TreatmentFormInner } from "./TreatmentFormInner";

export const TreatmentForm = forwardRef<FormApiRef, TreatmentFormProps>(
  function TreatmentForm(
    { initialData, onSubmit, isSubmitting = false, submitLabel, isUpdate },
    ref,
  ) {
    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultTreatmentFormValues,
            ...initialData,
            recoveryTime: initialData?.recoveryTime ?? "",
            anesthesia: initialData?.anesthesia ?? "",
            overview: initialData?.overview ?? "",
            tags: initialData?.tags ?? [],
            faqs:
              initialData?.faqs && initialData.faqs.length > 0
                ? initialData.faqs
                : defaultTreatmentFormValues.faqs,
            htmlDescription:
              initialData?.htmlDescription ??
              defaultTreatmentFormValues.htmlDescription,
            treatmentImage: initialData?.image || undefined,
          } as TreatmentFormValues,
          schema: TreatmentFormSchema,
        }),
      [initialData],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <TreatmentFormInner
          initialData={initialData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          isUpdate={isUpdate}
        />
      </FormProvider>
    );
  },
);
