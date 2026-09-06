import { useCallback } from "react";

import { Button, ButtonLoader, Toaster } from "@cosmediate/ui";
import {
  useFormIsDirty,
  useFormStore,
  useFormValidate,
} from "@cosmediate/form-core";

import {
  ClinicFormProps,
  ClinicFormValues,
} from "../../../../types/clinic.types";
import { FAQSection } from "../../../../components/clinicSetup/FaqSection";

export function ClinicFormInner({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: ClinicFormProps) {
  const store = useFormStore<ClinicFormValues>();
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
      <div className="w-full">
        <FAQSection initialFaqs={initialData?.faqs || []} />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="min-w-37.5 max-sm:w-full"
        >
          {isSubmitting ? <ButtonLoader /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
