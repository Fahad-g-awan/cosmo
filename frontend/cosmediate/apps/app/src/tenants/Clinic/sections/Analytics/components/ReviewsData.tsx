"use client";

import type { Clinic, Specialist } from "@cosmediate/type-utils";

import { EntityReviewsPanel } from "@app/modules/Reviews";
import { ClinicReviewsLoader, InfoMessage } from "@cosmediate/ui";

interface ReviewsDataProps {
  entity: Clinic | Specialist | null;
  isLoading?: boolean;
}

export const ReviewsData = ({
  entity,
  isLoading = false,
}: ReviewsDataProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      {!isLoading && entity && (
        <EntityReviewsPanel entity={entity} variant="analytics-preview" />
      )}

      {isLoading && !entity && (
        <div className="w-full flex flex-col items-center justify-start gap-5">
          <ClinicReviewsLoader />
        </div>
      )}

      {!isLoading && !entity && (
        <div className="w-full flex flex-col items-start justify-center gap-3">
          <div className="text-[18px] font-bold leading-[22px] text-700">
            Reviews
          </div>

          <InfoMessage
            title="No new reviews found"
            message="If you think this is a mistake, please refresh or contact support"
            variant="info"
            size="sm"
          />
        </div>
      )}
    </div>
  );
};
