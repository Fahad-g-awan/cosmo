import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import { AdminFormProps, AdminFormValues } from "../../types/admin.types";
import { defaultAdminFormValues } from "../../defaults/admins.defaults";
import { AdminFormSchema } from "../../schemas/adminForm.schema";
import { AdminFormInner } from "./AdminFormInner";

export const AdminForm = forwardRef<FormApiRef, AdminFormProps>(
  function AdminForm(
    { initialData, onSubmit, isSubmitting = false, submitLabel, isUpdate },
    ref,
  ) {
    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultAdminFormValues,
            ...initialData,
            age: initialData?.age ? parseInt(initialData.age, 10) : undefined,
            gender: initialData?.gender ?? undefined,
            adminImage: initialData?.image ? initialData.image : undefined,
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
          } as AdminFormValues,
          schema: AdminFormSchema,
        }),
      [initialData],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <AdminFormInner
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
