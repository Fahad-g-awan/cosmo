import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import { defaultAnnouncementFormValues } from "../defaults/announcement.defaults";
import { AnnouncementFormSchema } from "../schemas/announcementForm.schema";
import {
  AnnouncementFormProps,
  AnnouncementFormValues,
} from "../types/announcement.types";
import { AnnouncementFormInner } from "./AnnouncementFormInner";

export const AnnouncementForm = forwardRef<FormApiRef, AnnouncementFormProps>(
  function AnnouncementForm(
    { initialData, onSubmit, isSubmitting = false, submitLabel, isUpdate },
    ref,
  ) {
    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultAnnouncementFormValues,
            title: initialData?.title ?? defaultAnnouncementFormValues.title,
            message:
              initialData?.message ?? defaultAnnouncementFormValues.message,
            severity: initialData?.severity ?? undefined,
            status: initialData?.status ?? undefined,
            priority:
              initialData?.priority !== undefined &&
              initialData?.priority !== null
                ? initialData.priority
                : undefined,
            startsAt: initialData?.startsAt ?? "",
            endsAt: initialData?.endsAt ?? "",
            dismissible:
              initialData?.dismissible ??
              defaultAnnouncementFormValues.dismissible,
            targetRoles: initialData?.targetRoles ?? [],
            targetSurfaces: initialData?.targetSurfaces ?? [],
            actionLabel: initialData?.actionLabel ?? "",
            actionUrl: initialData?.actionUrl ?? "",
          } as AnnouncementFormValues,
          schema: AnnouncementFormSchema,
        }),
      [initialData],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <AnnouncementFormInner
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          isUpdate={isUpdate}
        />
      </FormProvider>
    );
  },
);
