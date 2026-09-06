import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Button,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { BsInfoCircle } from "react-icons/bs";
import { Minus } from "lucide-react";

interface SubTreatmentsHeaderProps {
  handleMinimize: (clinicTreatmentId: string) => void;
  treatmentName: string;
  clinicTreatmentId: string;
}

const SubTreatmentsHeader = ({
  handleMinimize,
  treatmentName,
  clinicTreatmentId,
}: SubTreatmentsHeaderProps) => {
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
        onClick={() => handleMinimize(clinicTreatmentId)}
        aria-label="Toggle sub-treatments"
      >
        <Minus className="size-5 text-600 hover:text-800" />
      </Button>
    </div>
  );
};

export const SUB_TREATMENT_ACTIONS_WIDTH = "w-11";

/**
 * Fields row (actions rendered separately, sticky).
 * Name + price tighter; duration + brands wider so selectors fit.
 */
export const subTreatmentFieldsClassName =
  "grid w-[38rem] shrink-0 grid-cols-[9rem_4.75rem_9rem_10rem_5.5rem] items-center sm:w-[46.2rem] sm:grid-cols-[13rem_7rem_10rem_11rem_5.5rem]";

export const SubTreatmentsColumnHeader = () => {
  return (
    <div className="sticky top-0 z-30 bg-white flex w-max items-stretch border-b border-stroke  text-300 text-[11px] font-medium">
      <div className={subTreatmentFieldsClassName}>
        <div className="min-w-0 px-2.5 py-2 sm:px-3 border-r border-stroke/50">
          Treatments
        </div>
        <div className="min-w-0 px-2.5 py-2 sm:px-3 border-r border-stroke/50">
          Price
        </div>
        <div className="min-w-0 px-2.5 py-2 sm:px-3 border-r border-stroke/50">
          Duration
        </div>
        <div className="min-w-0 px-2.5 py-2 sm:px-3 border-r border-stroke/50">
          Brands
        </div>
        <div className="flex items-center justify-center gap-1 self-stretch px-1 py-2 border-r border-stroke/50">
          <span>Available</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center"
                aria-label="About availability"
              >
                <BsInfoCircle className="size-3 text-400 hover:text-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Is treatment available for listings and appointment bookings.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div
        aria-hidden
        className={cn(
          SUB_TREATMENT_ACTIONS_WIDTH,
          "sticky right-0 z-40 bg-white shrink-0 self-stretch border-l border-stroke/50",
        )}
      />
    </div>
  );
};

export default SubTreatmentsHeader;
