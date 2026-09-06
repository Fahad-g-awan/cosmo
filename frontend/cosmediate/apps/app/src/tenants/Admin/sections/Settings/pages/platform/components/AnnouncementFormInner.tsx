import { useCallback } from "react";

import { Button, ButtonLoader, Toaster } from "@cosmediate/ui";
import {
  useFormIsDirty,
  useFormStore,
  useFormValidate,
} from "@cosmediate/form-core";
import {
  ControlledDatePickerField,
  ControlledSelectField,
  ControlledSwitchField,
  ControlledTextareaField,
  ControlledTextField,
  FormGrid,
  FormSection,
} from "@cosmediate/form-ui";

import {
  ANNOUNCEMENT_ROLE_OPTIONS,
  ANNOUNCEMENT_SEVERITY_OPTIONS,
  ANNOUNCEMENT_STATUS_OPTIONS,
  ANNOUNCEMENT_SURFACE_OPTIONS,
} from "../constants/announcements.constants";
import {
  AnnouncementFormProps,
  AnnouncementFormValues,
} from "../types/announcement.types";

export function AnnouncementFormInner({
  onSubmit,
  isSubmitting,
  submitLabel,
  isUpdate,
}: Pick<
  AnnouncementFormProps,
  "onSubmit" | "isSubmitting" | "submitLabel" | "isUpdate"
>) {
  const store = useFormStore<AnnouncementFormValues>();
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
        ...values,
        startsAt: values.startsAt?.trim() || "",
        endsAt: values.endsAt?.trim() || "",
        actionLabel: values.actionLabel?.trim() || "",
        actionUrl: values.actionUrl?.trim() || "",
      });
    },
    [onSubmit, store, validate],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Content">
        <FormGrid columns={1}>
          <ControlledTextField
            path="title"
            label="Title"
            placeholder="Announcement title"
            required
          />
          <ControlledTextareaField
            path="message"
            label="Message"
            placeholder="Banner message shown to users"
            required
            rows={4}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Delivery">
        <FormGrid columns={2}>
          <ControlledSelectField
            path="severity"
            label="Severity"
            placeholder="Select severity"
            options={[...ANNOUNCEMENT_SEVERITY_OPTIONS]}
            required
            clearable={false}
          />
          <ControlledSelectField
            path="status"
            label="Status"
            placeholder="Select status"
            options={[...ANNOUNCEMENT_STATUS_OPTIONS]}
            required
            clearable={false}
          />
          <ControlledTextField
            path="priority"
            label="Priority"
            type="number"
            placeholder="Optional (0–1000)"
          />
          <ControlledSwitchField
            path="dismissible"
            label="Dismissible"
            description="Allow users to dismiss this announcement"
          />
          <ControlledSelectField
            path="targetSurfaces"
            label="Target surfaces"
            options={[...ANNOUNCEMENT_SURFACE_OPTIONS]}
            multiple
            showSelectAll
            required
          />
          <ControlledSelectField
            path="targetRoles"
            label="Target roles"
            options={[...ANNOUNCEMENT_ROLE_OPTIONS]}
            multiple
            showSelectAll
            required
          />
          <ControlledDatePickerField
            path="startsAt"
            label="Starts at"
            placeholder="Optional start date"
          />
          <ControlledDatePickerField
            path="endsAt"
            label="Ends at"
            placeholder="Optional end date"
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Action (optional)">
        <p className="text-xs text-500 -mt-1 mb-2">
          If you set a label, URL is required — and vice versa.
        </p>
        <FormGrid columns={2}>
          <ControlledTextField
            path="actionLabel"
            label="Action label"
            placeholder="Learn more"
          />
          <ControlledTextField
            path="actionUrl"
            label="Action URL"
            placeholder="/settings/account/profile"
          />
        </FormGrid>
      </FormSection>

      <div className="flex justify-end border-t pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || (Boolean(isUpdate) && !isDirty)}
          className="min-w-[180px] max-sm:w-full"
        >
          {isSubmitting ? <ButtonLoader /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
