import { ScrollArea } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { ClinicTreatmentOffering } from "../../../../types/treatment.types";
import { TreatmentAssignmentType } from "../../../../types/treatment.types";
import { AssignmentAccordionFooter } from "./AssignmentAccordionFooter";
import { AssignmentAccordionHeader } from "./AssignmentAccordionHeader";
import { AssignmentRow, assignmentColumnsClassName } from "./AssignmentRow";

interface AssignmentOfferingAccordionProps {
  offering: ClinicTreatmentOffering;
  rows: TreatmentAssignmentType[];
  specialistOptions: { label: string; value: string }[];
  isMinimized: boolean;
  isSaving: boolean;
  canSave: boolean;
  onToggleMinimize: (clinicTreatmentId: string) => void;
  onFieldChange: (
    clinicTreatmentId: string,
    rowIndex: number,
    field: keyof TreatmentAssignmentType,
    value: string,
  ) => void;
  onRemove: (clinicTreatmentId: string, rowIndex: number) => void;
  onAdd: (clinicTreatmentId: string) => void;
  onSave: (clinicTreatmentId: string) => Promise<boolean | void>;
  onCancel: (clinicTreatmentId: string) => void;
}

export const AssignmentOfferingAccordion = ({
  offering,
  rows,
  specialistOptions,
  isMinimized,
  isSaving,
  canSave,
  onToggleMinimize,
  onFieldChange,
  onRemove,
  onAdd,
  onSave,
  onCancel,
}: AssignmentOfferingAccordionProps) => {
  const clinicTreatmentId = offering.id;
  const selectedSpecialistIds = rows
    .map((row) => row.specialistId)
    .filter(Boolean);

  return (
    <div className="w-full flex flex-col items-center justify-start gap-2.5 p-2 py-4 bg-ghost-blue rounded-xl">
      <AssignmentAccordionHeader
        treatmentName={offering.treatmentName}
        clinicTreatmentId={clinicTreatmentId}
        isMinimized={isMinimized}
        onToggleMinimize={onToggleMinimize}
      />

      {!isMinimized && (
        <div className="w-full flex flex-col border border-stroke rounded-xl bg-white overflow-hidden">
          <div
            className={cn(
              assignmentColumnsClassName,
              "border-b border-stroke bg-cloud/30 text-300 text-[11px] font-medium",
            )}
          >
            <div className="min-w-0 px-2.5 py-2 sm:px-3 border-r border-stroke/50">
              Specialist
            </div>
            <div className="min-w-0 px-2.5 py-2 sm:px-3 border-r border-stroke/50">
              Experience
            </div>
            <div aria-hidden className="self-stretch" />
          </div>

          <ScrollArea className="w-full h-[200px]">
            {rows.map((assignment, rowIndex) => (
              <AssignmentRow
                key={`${assignment.specialistId || "new"}-${rowIndex}`}
                assignment={assignment}
                clinicTreatmentId={clinicTreatmentId}
                rowIndex={rowIndex}
                isLast={rowIndex === rows.length - 1}
                isEven={rowIndex % 2 === 0}
                specialistOptions={specialistOptions}
                selectedSpecialistIds={selectedSpecialistIds}
                onFieldChange={onFieldChange}
                onRemove={onRemove}
                onAdd={onAdd}
              />
            ))}
          </ScrollArea>
        </div>
      )}

      <AssignmentAccordionFooter
        onSave={() => onSave(clinicTreatmentId)}
        onCancel={() => onCancel(clinicTreatmentId)}
        isLoading={isSaving}
        canSave={canSave}
      />
    </div>
  );
};
