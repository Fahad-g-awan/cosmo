import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import { ProfileFormProps, ProfileFormValues } from "../profile.types";
import { defaultProfileFormValues } from "../profile.defaults";
import { ProfileFormSchema } from "../profile.schema";
import { ProfileFormInner } from "./ProfileFormInner";

export const ProfileForm = forwardRef<FormApiRef, ProfileFormProps>(
  function ProfileForm(
    { initialData, onSubmit, isSubmitting = false },
    ref,
  ) {
    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultProfileFormValues,
            ...initialData,
            age: initialData.age ? parseInt(initialData.age, 10) : undefined,
            adminImage: initialData?.image ? initialData.image : undefined,
            perms: initialData?.perms ?? [],
          } as ProfileFormValues,
          schema: ProfileFormSchema,
        }),
      [initialData],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <ProfileFormInner
          initialData={initialData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </FormProvider>
    );
  },
);
