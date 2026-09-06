import { useCallback, useState } from "react";

import {
  useFormIsDirty,
  useFormStore,
  useFormValidate,
} from "@cosmediate/form-core";
import { Button, ButtonLoader, Toaster } from "@cosmediate/ui";
import { FormGrid, FormSection } from "@cosmediate/form-ui";

import { PasswordFormProps, PasswordFormValues } from "../password.types";
import { PasswordField } from "./PasswordField";

export const PasswordFormInner = ({
  userHasPassword,
  onSubmit,
  isSubmitting,
}: PasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const store = useFormStore<PasswordFormValues>();
  const validate = useFormValidate();
  const isDirty = useFormIsDirty();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        Toaster("Please fix the validation errors", "error");
        return;
      }

      const values = store.getState().values;
      await onSubmit(values);
    },
    [validate, store, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Password">
        <FormGrid columns={1}>
          {/* Old Password (only if user has password) */}
          {userHasPassword && (
            <PasswordField
              path="oldPassword"
              label="Current Password"
              placeholder="Enter current password"
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          )}

          {/* New Password */}
          <PasswordField
            path="newPassword"
            label="New Password"
            placeholder="Enter new password"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            hint="Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
          />

          {/* Confirm Password */}
          <PasswordField
            path="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm new password"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </FormGrid>
      </FormSection>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="min-w-[150px] max-sm:w-full"
        >
          {isSubmitting ? (
            <ButtonLoader />
          ) : userHasPassword ? (
            "Update Password"
          ) : (
            "Set Password"
          )}
        </Button>
      </div>
    </form>
  );
};
