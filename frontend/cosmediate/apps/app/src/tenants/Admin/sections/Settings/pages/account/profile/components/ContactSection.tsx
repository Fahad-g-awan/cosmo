import {
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";

import { normalizePhone, PHONE_FORMAT_HINT } from "@app/lib/phone";

export const ContactSection = () => {
  return (
    <FormSection title="Contact Information">
      <FormGrid columns={2} className="lg:grid-cols-1 xl:grid-cols-2">
        <div className="space-y-2">
          <ControlledTextField
            path="email"
            label="Email"
            type="email"
            required
            disabled
          />
          <p className="text-xs text-500">Email cannot be changed</p>
        </div>
        <div className="space-y-2">
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
