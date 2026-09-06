import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import { PatientFormProps, PatientFormValues } from "../../types/patient.types";
import { defaultPatientFormValues } from "../../defaults/patient.defaults";
import { PatientFormSchema } from "../../schemas/patientForm.schema";
import { PatientFormInner } from "./PatientFormInner";

export const PatientForm = forwardRef<FormApiRef, PatientFormProps>(
  function PatientForm(
    { initialData, onSubmit, isSubmitting = false, submitLabel, isUpdate },
    ref,
  ) {
    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultPatientFormValues,
            ...initialData,
            age: initialData?.age ? parseInt(initialData.age, 10) : undefined,
            gender: initialData?.gender ?? undefined,
            patientImage: initialData?.image ? initialData.image : undefined,
            phone:
              initialData?.phone &&
              initialData.phone.trim().toUpperCase() !== "N/A"
                ? initialData.phone
                : "",
            country: initialData?.country ?? undefined,
            state: initialData?.state ?? undefined,
            city: initialData?.city ?? undefined,
            postalCode: initialData?.postalCode ?? undefined,
            completeAddress: initialData?.completeAddress ?? undefined,
            perms: initialData?.perms ?? [],
          } as PatientFormValues,
          schema: PatientFormSchema,
        }),
      [initialData],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <PatientFormInner
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
