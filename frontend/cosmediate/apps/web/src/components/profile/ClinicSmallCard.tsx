import React from "react";

import { Clinic } from "@cosmediate/type-utils";

import { ClinicCard } from "../clinics/ClinicCard";
import { truncateText } from "@web/lib/utils";

export const ClinicSmallCard = ({
  clinic,
  onClick,
}: {
  clinic: Clinic;
  onClick: () => void;
}) => {
  return (
    <ClinicCard
      onClick={onClick}
      className="w-[300px] shrink-0 flex-row gap-4 shadow py-3 px-3 mb-1 rounded-xl bg-cloud/10 cursor-pointer"
    >
      <ClinicCard.Logo logo={clinic?.logo} />

      <div className="w-full flex flex-col items-start justify-start gap-1">
        <ClinicCard.Title
          title={truncateText(clinic?.name, 20)}
          variant="sm"
          className="text-[13px]"
        />
        <ClinicCard.Address
          address={truncateText(clinic?.completeAddress, 20)}
        />
      </div>
    </ClinicCard>
  );
};
