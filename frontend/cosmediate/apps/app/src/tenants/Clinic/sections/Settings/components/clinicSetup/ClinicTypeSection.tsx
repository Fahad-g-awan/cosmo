import { useFormError, useFormSetValue, useFormValue } from "@cosmediate/form-core";
import { FieldError, FormSection } from "@cosmediate/form-ui";
import { Label, Switch } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

/** Clinic setup: only availability is editable. Type/status are admin-managed. */
export const ClinicTypeSection = () => {
  const available = useFormValue<boolean | undefined>("available");
  const availableError = useFormError("available");
  const setValue = useFormSetValue();

  return (
    <FormSection title="Availability">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Switch
            id="available"
            checked={available === true}
            onCheckedChange={(checked) => setValue("available", checked)}
            className={cn(availableError && "ring-1 ring-red-500 rounded-full")}
          />
          <Label htmlFor="available" className="text-sm">
            Clinic is available for bookings
          </Label>
        </div>
        <FieldError error={availableError} />
      </div>
    </FormSection>
  );
};
