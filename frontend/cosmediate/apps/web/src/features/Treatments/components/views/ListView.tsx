import React from "react";

import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Treatment } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { TreatmentCard } from "@web/components/treatments/TreatmentCard";
import { truncateText } from "@web/lib/utils";

export const ListView = ({ treatment }: { treatment: Treatment }) => {
  const { isMobileView, isTabletView } = useWindowWidth();

  return (
    <TreatmentCard className="w-full flex flex-row items-start justify-center gap-6 max-sm:gap-2">
      <TreatmentCard.Image
        src={treatment?.image}
        alt={treatment?.name}
        containerClassName="w-[350px] h-[150px] max-lg:w-[300px] max-sm:w-[150px] max-sm:h-[100px]"
      >
        {!isMobileView && (
          <TreatmentCard.Labels
            clinicCount={treatment?.clinicCount || 0}
            doctorCount={treatment?.specialistCount || 0}
          />
        )}
      </TreatmentCard.Image>

      <div
        className={cn(
          "w-full flex items-start gap-6 max-sm:gap-2",
          isMobileView
            ? "h-[100px] flex-col justify-between"
            : "flex-row justify-start"
        )}
      >
        <div className="w-full flex flex-col items-start justify-start gap-2">
          <TreatmentCard.Title
            title={truncateText(treatment?.name, isMobileView ? 15 : 30)}
          />

          <TreatmentCard.Description
            description={truncateText(
              treatment?.overview,
              isMobileView ? 20 : isTabletView ? 200 : 400
            )}
            className="h-full"
          />
        </div>

        <TreatmentCard.Button
          url={`/treatments/${treatment.id}`}
          className={cn(isMobileView && "text-sm p-2 w-full text-center")}
        >
          Explore
        </TreatmentCard.Button>
      </div>
    </TreatmentCard>
  );
};
