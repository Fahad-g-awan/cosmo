import { useCallback } from "react";

import { Button, ButtonLoader, Toaster } from "@cosmediate/ui";
import {
  useFormIsDirty,
  useFormStore,
  useFormValidate,
} from "@cosmediate/form-core";

import { BrandFormProps, BrandFormValues } from "../../../types/brand.types";
import { PublishedSection } from "./PublishedSection";
import { NamesSection } from "./NamesSection";
import { NameSection } from "./NameSection";

export function BrandFormInner({
  onSubmit,
  isSubmitting,
  submitLabel,
  mode = "single",
}: Omit<BrandFormProps, "initialData">) {
  const store = useFormStore<BrandFormValues>();
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
      await onSubmit({
        names: values.names.map((n) => n.trim()),
        published: values.published,
      });
    },
    [validate, store, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === "single" ? <NameSection /> : <NamesSection />}

      <PublishedSection />

      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || (mode === "single" && !isDirty)}
          className="min-w-37.5 max-sm:w-full"
        >
          {isSubmitting ? <ButtonLoader /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
