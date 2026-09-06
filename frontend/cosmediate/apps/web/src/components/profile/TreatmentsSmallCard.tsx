import React from "react";

import { Treatment } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { TreatmentCard } from "../treatments/TreatmentCard";
import { truncateText } from "@web/lib/utils";

export const TreatmentsSmallCard = ({
  treatment,
  category,
  containerClassName,
}: {
  treatment: Treatment;
  category: string;
  containerClassName?: string;
}) => {
  return (
    <TreatmentCard
      className={cn(
        "w-[250px] shrink-0 flex flex-col items-start justify-center gap-3",
        containerClassName
      )}
    >
      <TreatmentCard.Image
        src={treatment?.image}
        alt={treatment?.name}
        className="h-[167px]"
      >
        <TreatmentCard.Category category={category} />
        <TreatmentCard.Price price={treatment?.minPrice || 0} />
      </TreatmentCard.Image>

      <TreatmentCard.Title title={truncateText(treatment?.name, 30)} />
      <TreatmentCard.Description
        description={truncateText(treatment?.overview, 60)}
      />

      <TreatmentCard.Button url={`/treatments/${treatment.id}`}>
        Explore
      </TreatmentCard.Button>
    </TreatmentCard>
  );
};
