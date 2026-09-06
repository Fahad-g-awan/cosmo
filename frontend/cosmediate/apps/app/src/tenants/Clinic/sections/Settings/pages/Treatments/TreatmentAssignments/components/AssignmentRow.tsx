import { ComboboxSelect, Input } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { FiPlus } from "react-icons/fi";
import { X } from "lucide-react";

import { isValidTreatmentAssignment } from "../../../../defaults/treatment.defaults";
import { TreatmentAssignmentType } from "../../../../types/treatment.types";

/** Shared column template — specialist gets more room than experience. */
export const assignmentColumnsClassName =
  "grid w-full grid-cols-[minmax(0,1.65fr)_minmax(0,0.85fr)_2.5rem] sm:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)_3.125rem] items-center";

interface AssignmentRowProps {
  assignment: TreatmentAssignmentType;
  clinicTreatmentId: string;
  rowIndex: number;
  isLast: boolean;
  isEven: boolean;
  specialistOptions: { label: string; value: string }[];
  selectedSpecialistIds: string[];
  onFieldChange: (
    clinicTreatmentId: string,
    rowIndex: number,
    field: keyof TreatmentAssignmentType,
    value: string,
  ) => void;
  onRemove: (clinicTreatmentId: string, rowIndex: number) => void;
  onAdd: (clinicTreatmentId: string) => void;
}

export const AssignmentRow = ({
  assignment,
  clinicTreatmentId,
  rowIndex,
  isLast,
  isEven,
  specialistOptions,
  selectedSpecialistIds,
  onFieldChange,
  onRemove,
  onAdd,
}: AssignmentRowProps) => {
  const availableOptions = specialistOptions.filter(
    (option) =>
      option.value === assignment.specialistId ||
      !selectedSpecialistIds.includes(option.value),
  );
  const canAdd = isValidTreatmentAssignment(assignment);

  return (
    <div
      className={cn(
        assignmentColumnsClassName,
        "border-b border-stroke",
        isEven && "bg-cloud/40",
      )}
    >
      <div className="min-w-0 border-r px-2.5 py-2 sm:px-3 border-stroke/50 hover:bg-ghost-blue-2">
        <ComboboxSelect
          options={availableOptions}
          value={assignment.specialistId}
          onValueChange={(value: string) =>
            onFieldChange(clinicTreatmentId, rowIndex, "specialistId", value)
          }
          placeholder="Select specialist"
          buttonClassName="border-none bg-transparent p-0 w-full hover:bg-ghost-blue-2"
        />
      </div>
      <div className="min-w-0 px-2.5 py-2 sm:px-3 border-r border-stroke/50">
        <Input
          value={assignment.specialistExperience}
          onChange={(e) =>
            onFieldChange(
              clinicTreatmentId,
              rowIndex,
              "specialistExperience",
              e.target.value,
            )
          }
          placeholder="e.g. 8 years"
          className="w-full min-w-0 p-0 text-600 text-[12px] font-medium border-0 outline-none rounded-none"
        />
      </div>
      <div className="flex items-center justify-center self-stretch">
        {!isLast ? (
          <X
            className="size-3.5 cursor-pointer text-danger hover:text-red-500"
            onClick={() => onRemove(clinicTreatmentId, rowIndex)}
          />
        ) : (
          <FiPlus
            className={cn(
              "size-5 transition-colors",
              canAdd
                ? "cursor-pointer text-primary-accent hover:text-primary-accent-dark"
                : "cursor-not-allowed text-300 opacity-50",
            )}
            onClick={() => {
              if (!canAdd) return;
              onAdd(clinicTreatmentId);
            }}
            aria-disabled={!canAdd}
          />
        )}
      </div>
    </div>
  );
};
