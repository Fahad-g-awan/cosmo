import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import {
  SetPasswordFormSchema,
  UpdatePasswordSchema,
} from "../password.schema";
import { defaultPasswordFormValues } from "../password.defaults";
import { PasswordFormProps } from "../password.types";
import { PasswordFormInner } from "./PasswordInner";

export const PasswordForm = forwardRef<FormApiRef, PasswordFormProps>(
  function PasswordForm({ userHasPassword, onSubmit, isSubmitting }, ref) {
    const schema = useMemo(() => {
      if (userHasPassword) {
        return UpdatePasswordSchema;
      }
      return SetPasswordFormSchema;
    }, [userHasPassword]);

    const store = useMemo(
      () =>
        createFormStore({
          initialValues: defaultPasswordFormValues,
          schema,
        }),
      [schema],
    );

    useFormApiHandle(store, ref);

    return (
      <FormProvider store={store}>
        <PasswordFormInner
          userHasPassword={userHasPassword}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </FormProvider>
    );
  },
);
