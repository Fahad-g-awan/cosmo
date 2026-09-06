import { useCallback } from "react";

import {
  Button,
  ButtonLoader,
  Toaster,
} from "@cosmediate/ui";
import {
  useFormIsDirty,
  useFormStore,
  useFormValidate,
} from "@cosmediate/form-core";
import { useAuth } from "@cosmediate/auth/index";

import { FormSingleImageUpload } from "@app/components/form/FormSingleImageUpload";

import { ProfileFormProps, ProfileFormValues } from "../profile.types";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { AgeGenderSection } from "./AgeGenderSection";
import { LocationSection } from "./LocationSection";
import { ContactSection } from "./ContactSection";

export function ProfileFormInner({
  initialData,
  onSubmit,
  isSubmitting,
}: ProfileFormProps) {
  const store = useFormStore<ProfileFormValues>();
  const validate = useFormValidate();
  const isDirty = useFormIsDirty();
  const { session } = useAuth();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!session?.tokens?.accessToken) {
        Toaster("Authentication required", "error");
        return;
      }

      if (!validate()) {
        Toaster("Please fix the validation errors", "error");
        return;
      }

      const values = store.getState().values;
      await onSubmit(values);
    },
    [validate, store, onSubmit, session?.tokens?.accessToken]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      <div className="grid grid-cols-3 max-xl:grid-cols-2 max-lg:grid-cols-3 max-sm:grid-cols-1 gap-8">
        {/* Left Column - Image & Basic Info */}
        <div className="sm:col-span-1">
          <div className="sticky top-4 space-y-4">
            <FormSingleImageUpload path="patientImage" />
            <AgeGenderSection />
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="col-span-2 max-xl:col-span-1 max-lg:col-span-2 max-sm:col-span-1 space-y-6">
          <PersonalInfoSection />
          <ContactSection />
          <LocationSection />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="min-w-[150px] max-sm:w-full"
        >
          {isSubmitting ? <ButtonLoader /> : "Update Profile"}
        </Button>
      </div>
    </form>
  );
}
