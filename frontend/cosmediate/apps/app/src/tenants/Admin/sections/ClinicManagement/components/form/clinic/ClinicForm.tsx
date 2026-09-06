import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import { defaultClinicFormValues } from "../../../defaults/clinic.defaults";
import {
  ClinicCreateFormSchema,
  ClinicUpdateFormSchema,
} from "../../../schemas/clinicForm.schema";
import { ClinicFormProps } from "../../../types/clinic.types";
import { ClinicFormInner } from "./ClinicFormInner";

export const ClinicForm = forwardRef<FormApiRef, ClinicFormProps>(
  function ClinicForm(
    {
      initialData,
      onSubmit,
      isSubmitting = false,
      submitLabel,
      mode,
    },
    ref,
  ) {
    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultClinicFormValues,
            ...initialData,
            clinicLogo: initialData?.logo || "",
            clinicImages: initialData?.images || [],
            categories: initialData?.categories?.map((cat) => cat.id) || [],
            managerIds:
              initialData?.managers?.map((manager) => manager?.id || "") || [],
            overview: initialData?.overview || "",
            faqs: initialData?.faqs?.length ? initialData.faqs : [],
          },
          schema:
            mode === "update"
              ? ClinicUpdateFormSchema
              : ClinicCreateFormSchema,
        }),
      [initialData, mode],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <ClinicFormInner
          initialData={initialData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          mode={mode}
        />
      </FormProvider>
    );
  },
);
