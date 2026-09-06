import { forwardRef, useMemo } from "react";
import type { z } from "zod";

import { createFormStore, FormProvider } from "@cosmediate/form-core";
import { Clinic, Specialist } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import { defaultClinicFormValues } from "../../defaults/clinic.defaults";
import {
  ClinicFormSchema,
  SpecialistSetupFormSchema,
} from "../../schemas/clinicForm.schema";
import { ClinicFormProps, ClinicFormValues } from "../../types/clinic.types";

function parseOptionalInt(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed =
    typeof value === "string" ? parseInt(value, 10) : Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export const ClinicForm = forwardRef<
  FormApiRef,
  Partial<ClinicFormProps> & { children: React.ReactNode }
>(function ClinicForm({ initialData, children }, ref) {
  const { userRole } = useAuth();
  const isSpecialist = userRole === "SPECIALIST";

  const store = useMemo(() => {
    const clinic = initialData as Clinic | undefined;
    const specialist = initialData as Specialist | undefined;

    // Shared shell values type covers both clinic and specialist setup shapes.
    const schema = (
      isSpecialist ? SpecialistSetupFormSchema : ClinicFormSchema
    ) as z.ZodType<ClinicFormValues>;

    return createFormStore({
      initialValues: {
        ...defaultClinicFormValues,
        ...initialData,
        overview: initialData?.overview || "",
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
        age: parseOptionalInt(specialist?.age),
        totalExperience: parseOptionalInt(specialist?.totalExperience),
        gender: specialist?.gender ?? undefined,
        specialistImage: specialist?.image || undefined,
        clinicLogo: clinic?.logo || undefined,
        clinicImages: clinic?.images || undefined,
        categories: clinic?.categories?.map((cat) => cat.id) || [],
        available: initialData?.available ?? false,
        // Seeded for BE required fields — not editable in specialist setup UI
        status: initialData?.status,
        workingType: specialist?.workingType,
        parentClinicId: specialist?.parentClinicId ?? undefined,
        clinicIds: specialist?.clinicIds ?? undefined,
      } as ClinicFormValues,
      schema,
    });
  }, [initialData, isSpecialist]);

  useFormApiHandle(store, ref);

  return <FormProvider store={store}>{children}</FormProvider>;
});
