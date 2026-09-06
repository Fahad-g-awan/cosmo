import {
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";

import { normalizePhone, PHONE_FORMAT_HINT } from "@app/lib/phone";

export const ContactSection = ({
  isUpdate = false,
}: {
  isUpdate?: boolean;
}) => {
  return (
    <FormSection title="Contact Information">
      <FormGrid columns={2} className="max-lg:grid-cols-1">
        <div className="w-full space-y-2">
          <ControlledTextField
            className="w-full max-lg:col-span-2"
            path="email"
            label="Email"
            type="email"
            required
            disabled={isUpdate}
          />
          {isUpdate && (
            <p className="w-full text-xs text-500">Email cannot be changed</p>
          )}
        </div>
        <div className="w-full space-y-2 max-lg:col-span-2">
          <ControlledTextField
            path="phone"
            label="Phone"
            type="tel"
            placeholder="+1 555 123 4567"
            transformOnBlur={(value) => normalizePhone(value)}
          />
          <p className="text-xs text-500">{PHONE_FORMAT_HINT}</p>
        </div>
      </FormGrid>
    </FormSection>
  );
};
