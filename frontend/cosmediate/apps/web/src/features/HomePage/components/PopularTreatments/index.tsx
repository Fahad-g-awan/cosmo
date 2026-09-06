"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { SiteContainer, TreatmentsLoader } from "@cosmediate/ui";
import { Treatment } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { TreatmentCard } from "@web/components/treatments/TreatmentCard";
import { truncateText } from "@web/lib/utils";

interface PopularTreatmentsProps {
  treatments: Treatment[];
  isLoading: boolean;
}

const PopularTreatments: React.FC<PopularTreatmentsProps> = ({
  treatments,
  isLoading,
}) => {
  const home = useTranslations("marketing").home;
  const showTreatments = treatments.length > 0 && !isLoading;
  const showLoading = treatments.length < 1 && isLoading;

  if (!showTreatments && !showLoading) return <div></div>;

  return (
    <SiteContainer className="gap-14">
      <div
        className={cn(
          "w-full flex items-center justify-center",
          "text-700 font-semibold text-[42px] leading-13 max-sm:text-[20px] max-sm:leading-6",
          "max-sm:text-center"
        )}
      >
        {home.popularTreatments}
      </div>

      {showLoading && <TreatmentsLoader />}

      {showTreatments && (
        <div
          className={cn(
            "w-full grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-x-[29.33px] gap-y-[72px]",
            "max-lg:gap-[40px]"
          )}
        >
          {treatments?.map((treatment: Treatment) => (
            <RenderCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      )}
    </SiteContainer>
  );
};

const RenderCard = ({ treatment }: { treatment: Treatment }) => {
  const home = useTranslations("marketing").home;

  return (
    <TreatmentCard className="flex flex-col items-start justify-center gap-6">
      <TreatmentCard.Image
        src={treatment?.image}
        alt={treatment?.name}
        containerClassName="h-[170px]"
      >
        {treatment?.categoryName && (
          <TreatmentCard.Category category={treatment?.categoryName} />
        )}
        {(treatment?.minPrice ?? 0) > 0 && (
          <TreatmentCard.Price price={treatment.minPrice!} />
        )}
      </TreatmentCard.Image>

      <div className="w-full flex flex-col items-start justify-start gap-2">
        <div className="w-full flex flex-col items-start justify-start gap-2">
          <TreatmentCard.Title title={truncateText(treatment?.name, 30)} />
          <TreatmentCard.Description
            description={truncateText(treatment?.overview, 100)}
          />
        </div>

        <TreatmentCard.Button url={`/treatments/${treatment.id}`}>
          {home.exploreCta}
        </TreatmentCard.Button>
      </div>
    </TreatmentCard>
  );
};

export default PopularTreatments;
