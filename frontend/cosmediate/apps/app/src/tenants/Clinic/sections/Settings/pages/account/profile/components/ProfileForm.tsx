import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import { ProfileFormProps, ProfileFormValues } from "../profile.types";
import { defaultProfileFormValues } from "../profile.defaults";
import { getImageField } from "../profile.constants";
import { ProfileFormSchema } from "../profile.schema";
import { ProfileFormInner } from "./ProfileFormInner";

export const ProfileForm = forwardRef<FormApiRef, ProfileFormProps>(
  function ProfileForm(
    { role, initialData, onSubmit, isSubmitting = false },
    ref,
  ) {
    const imageField = getImageField(role);

    const store = useMemo(
      () =>
        createFormStore({
          initialValues: {
            ...defaultProfileFormValues,
            ...initialData,
            age: initialData.age ? parseInt(initialData.age, 10) : undefined,
            [imageField]: initialData?.image ? initialData.image : undefined,
            perms: initialData?.perms ?? [],
          } as ProfileFormValues,
          schema: ProfileFormSchema,
        }),
      [initialData, imageField],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <ProfileFormInner
          role={role}
          initialData={initialData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </FormProvider>
    );
  },
);
