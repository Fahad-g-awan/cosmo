import React from "react";

import { Treatment } from "@cosmediate/type-utils";

import { TreatmentCard } from "@web/components/treatments/TreatmentCard";
import { truncateText } from "@web/lib/utils";

export const GridView = ({ treatment }: { treatment: Treatment }) => {
  return (
    <TreatmentCard className="flex flex-col items-start justify-center gap-6">
      <TreatmentCard.Image
        src={treatment?.image}
        alt={treatment?.name}
        containerClassName="h-[260px]"
      >
        <TreatmentCard.Labels
          clinicCount={treatment?.clinicCount || 0}
          doctorCount={treatment?.specialistCount || 0}
        />
      </TreatmentCard.Image>

      <div className="w-full flex flex-col items-start justify-start gap-2">
        <div className="w-full flex flex-col items-start justify-start gap-2">
          <TreatmentCard.Title title={truncateText(treatment?.name, 30)} />
          <TreatmentCard.Description
            description={truncateText(treatment?.overview, 100)}
          />
        </div>

        <TreatmentCard.Button url={`/treatments/${treatment.id}`}>
          Explore
        </TreatmentCard.Button>
      </div>
    </TreatmentCard>
  );
};
