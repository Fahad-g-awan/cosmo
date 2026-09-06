import { Button } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { Minus } from "lucide-react";

interface AdminResultsAccordionHeaderProps {
  treatmentName: string;
  treatmentId: string;
  isMinimized: boolean;
  onToggleMinimize: (treatmentId: string) => void;
}

export const AdminResultsAccordionHeader = ({
  treatmentName,
  treatmentId,
  isMinimized,
  onToggleMinimize,
}: AdminResultsAccordionHeaderProps) => {
  return (
    <div className="w-full px-3.75 flex flex-col items-start justify-start gap-2.5">
      <div className="w-full flex items-center justify-between gap-2">
        <div
          className={cn(
            "w-full flex items-center justify-start",
            "text-700 text-[15px] leading-3.75 font-semibold capitalize",
          )}
        >
          {treatmentName}
        </div>

        <Button
          variant="ghost"
          className="w-[20px] flex items-center justify-center"
          onClick={() => onToggleMinimize(treatmentId)}
        >
          <Minus className="size-5 text-600 hover:text-800" />
        </Button>
      </div>

      {!isMinimized && (
        <p className="text-300 text-[11px] font-medium max-sm:hidden">
          Before / after gallery
        </p>
      )}
    </div>
  );
};
