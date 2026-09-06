import React from "react";

import { TreatmentResult as TreatmentResultType } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { BeforeAfterSlider } from "./BeforeAfterSlider";

export const TreatmentResultCard = ({
  treatmentResults,
}: {
  treatmentResults: TreatmentResultType;
}) => {
  return (
    <div
      className={cn(
        "w-[300px]  shrink-0 flex flex-col items-center justify-start gap-3 rounded-xl"
      )}
    >
      <div className={cn("w-full flex items-center justify-center")}>
        <BeforeAfterSlider
          beforeImage={treatmentResults?.beforeImage}
          afterImage={treatmentResults?.afterImage}
          width="100%"
          height={250}
          rounded={true}
        />
      </div>
      <div className="w-full h-[50px] overflow-y-auto overflow-lite text-700 text-sm text-center flex items-start justify-center">
        {treatmentResults?.description}
      </div>
    </div>
  );
};
