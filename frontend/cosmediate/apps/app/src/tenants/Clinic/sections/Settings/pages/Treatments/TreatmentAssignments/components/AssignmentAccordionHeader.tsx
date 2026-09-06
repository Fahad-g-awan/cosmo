import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";
import { Minus } from "lucide-react";

interface AssignmentAccordionHeaderProps {
  treatmentName: string;
  clinicTreatmentId: string;
  isMinimized: boolean;
  onToggleMinimize: (clinicTreatmentId: string) => void;
}

export const AssignmentAccordionHeader = ({
  treatmentName,
  clinicTreatmentId,
  isMinimized,
  onToggleMinimize,
}: AssignmentAccordionHeaderProps) => {
  return (
    <div className="w-full px-3 sm:px-3.75 flex items-center justify-between gap-2">
      <div
        className={cn(
          "min-w-0 flex-1",
          "text-700 text-[15px] leading-snug font-semibold capitalize",
        )}
      >
        {treatmentName}
      </div>

      <Button
        variant="ghost"
        className="size-8 shrink-0 flex items-center justify-center"
        onClick={() => onToggleMinimize(clinicTreatmentId)}
        aria-label={isMinimized ? "Expand" : "Minimize"}
      >
        <Minus className="size-5 text-600 hover:text-800" />
      </Button>
    </div>
  );
};
