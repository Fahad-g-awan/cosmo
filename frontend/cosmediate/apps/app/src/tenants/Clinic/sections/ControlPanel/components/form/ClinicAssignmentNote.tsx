import { FormSection } from "@cosmediate/form-ui";
import { InfoMessage } from "@cosmediate/ui";

export function ClinicAssignmentNote({ isUpdate = false }: { isUpdate?: boolean }) {
  return (
    <FormSection title="Clinic Assignment">
      <InfoMessage
        title={isUpdate ? "Assigned clinic" : "Active clinic"}
        message={
          isUpdate
            ? "This manager stays linked to their clinic. Clinic assignment is managed by platform admin."
            : "This manager will be linked to the clinic currently selected in your dashboard switcher."
        }
        variant="info"
        size="sm"
      />
    </FormSection>
  );
}
