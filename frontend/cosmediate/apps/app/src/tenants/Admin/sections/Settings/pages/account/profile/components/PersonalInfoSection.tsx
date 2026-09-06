import {
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";
import { useFormValue } from "@cosmediate/form-core";
import { Input, Label } from "@cosmediate/ui";

export const PersonalInfoSection = () => {
  const firstName = useFormValue<string>("firstName");
  const lastName = useFormValue<string>("lastName");
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  return (
    <FormSection title="Personal Information">
      <FormGrid columns={3} className="lg:grid-cols-1 xl:grid-cols-3">
        <ControlledTextField path="firstName" label="First Name" required />
        <ControlledTextField path="lastName" label="Last Name" required />
        <div className="space-y-2 max-lg:col-span-2 max-sm:col-span-1">
          <Label className="text-sm font-medium">Full Name</Label>
          <Input
            value={fullName}
            readOnly
            placeholder="Auto-generated"
            className="bg-gray-50"
          />
        </div>
      </FormGrid>
    </FormSection>
  );
};
