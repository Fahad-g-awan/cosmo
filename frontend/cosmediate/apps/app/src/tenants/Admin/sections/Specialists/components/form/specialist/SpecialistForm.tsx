import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";
import {
  FALLBACK_ROLE_IMPLICIT_GRANTS,
  filterImplicitGrants,
  getImplicitGrantsForRole,
} from "@app/lib/permissions";

import { defaultSpecialistFormValues } from "../../../defaults/specialist.defaults";
import { SpecialistFormSchema } from "../../../schemas/specialistForm.schema";
import {
  SpecialistFormProps,
  SpecialistFormValues,
} from "../../../types/specialist.types";
import { SpecialistFormInner } from "./SpecialistFormInner";

export const SpecialistForm = forwardRef<FormApiRef, SpecialistFormProps>(
  function SpecialistForm(
    {
      initialData,
      onSubmit,
      isSubmitting = false,
      submitLabel,
      isUpdate,
      clinicDashboard = false,
      defaultParentClinicId,
    },
    ref,
  ) {
    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultSpecialistFormValues,
            ...initialData,
            overview: initialData?.overview || "",
            specialistImage: initialData?.image
              ? initialData.image
              : undefined,
            phone:
              initialData?.phone &&
              initialData.phone.trim().toUpperCase() !== "N/A"
                ? initialData.phone
                : "",
            gender: initialData?.gender ?? undefined,
            age: (() => {
              if (initialData?.age == null || initialData.age === "") {
                return undefined;
              }
              const parsed =
                typeof initialData.age === "string"
                  ? parseInt(initialData.age, 10)
                  : Number(initialData.age);
              return Number.isNaN(parsed) ? undefined : parsed;
            })(),
            totalExperience: (() => {
              if (
                initialData?.totalExperience == null ||
                initialData.totalExperience === ""
              ) {
                return undefined;
              }
              const parsed =
                typeof initialData.totalExperience === "string"
                  ? parseInt(initialData.totalExperience, 10)
                  : Number(initialData.totalExperience);
              return Number.isNaN(parsed) ? undefined : parsed;
            })(),
            country: initialData?.country ?? undefined,
            state: initialData?.state ?? undefined,
            city: initialData?.city ?? undefined,
            postalCode: initialData?.postalCode ?? undefined,
            completeAddress: initialData?.completeAddress ?? undefined,
            parentClinicId:
              initialData?.parentClinicId ??
              defaultParentClinicId ??
              undefined,
            clinicIds: initialData?.clinicIds ?? undefined,
            perms: filterImplicitGrants(
              initialData?.perms ?? [],
              getImplicitGrantsForRole(
                "SPECIALIST",
                undefined,
                FALLBACK_ROLE_IMPLICIT_GRANTS,
              ),
            ),
            ...(clinicDashboard && !isUpdate
              ? {
                  workingType: "FULL_TIME" as const,
                  parentClinicId:
                    defaultParentClinicId ??
                    initialData?.parentClinicId ??
                    undefined,
                }
              : {}),
          } as SpecialistFormValues,
          schema: SpecialistFormSchema,
        }),
      [initialData, clinicDashboard, isUpdate, defaultParentClinicId],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <SpecialistFormInner
          initialData={initialData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          isUpdate={isUpdate}
          clinicDashboard={clinicDashboard}
        />
      </FormProvider>
    );
  },
);
