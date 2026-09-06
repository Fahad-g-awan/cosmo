import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";
import {
  FALLBACK_ROLE_IMPLICIT_GRANTS,
  filterImplicitGrants,
  getImplicitGrantsForRole,
} from "@app/lib/permissions";

import {
  ManagerFormProps,
  ManagerFormValues,
} from "../../../types/manager.types";
import { defaultManagerFormValues } from "../../../defaults/manager.defaults";
import { ManagerFormSchema } from "../../../schemas/managerForm.schema";
import { ManagerFormInner } from "./ManagerFormInner";

export const ManagerForm = forwardRef<FormApiRef, ManagerFormProps>(
  function ManagerForm(
    {
      initialData,
      onSubmit,
      isSubmitting = false,
      submitLabel,
      isUpdate,
    },
    ref,
  ) {
    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultManagerFormValues,
            ...initialData,
            age: initialData?.age ? parseInt(initialData.age, 10) : undefined,
            gender: initialData?.gender ?? undefined,
            managerImage: initialData?.image ? initialData.image : undefined,
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
            clinicId: undefined,
            clinicIds: isUpdate
              ? initialData?.clinicIds?.length
                ? initialData.clinicIds
                : ((initialData?.clinics
                    ?.map((clinic) => clinic?.id)
                    .filter(Boolean) as string[] | undefined) ?? [])
              : undefined,
            perms: filterImplicitGrants(
              initialData?.perms ?? [],
              getImplicitGrantsForRole(
                "MANAGER",
                undefined,
                FALLBACK_ROLE_IMPLICIT_GRANTS,
              ),
            ),
          } as ManagerFormValues,
          schema: ManagerFormSchema,
        }),
      [initialData, isUpdate],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <ManagerFormInner
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
