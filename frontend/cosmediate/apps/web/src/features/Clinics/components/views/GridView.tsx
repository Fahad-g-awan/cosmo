import React from "react";

import { Clinic } from "@cosmediate/type-utils";

import { ClinicCard } from "@web/components/clinics/ClinicCard";
import { truncateText } from "@web/lib/utils";

export const GridView = ({ clinic }: { clinic: Clinic }) => {
  return (
    <ClinicCard className="w-full gap-4 overflow-hidden">
      <ClinicCard.Image
        className="w-full h-[220px]"
        image={clinic?.images?.[0] || ""}
        logo={clinic?.logo}
      />

      <div className="w-full h-28 flex flex-col items-start justify-start gap-4">
        <ClinicCard.Title
          title={truncateText(clinic.name, 30)}
          variant="sm"
          className="text-[13px]"
        />
        <div className="w-full flex items-center justify-start gap-4">
          <ClinicCard.Ratings
            ratings={{
              avgRating: clinic.avgRating || 0,
              reviewCount: clinic.reviewCount || 0,
            }}
            className="w-fit"
          />
          <ClinicCard.Address
            address={truncateText(clinic.completeAddress, 40)}
            className="w-full"
          />
        </div>

        {/* <div className="w-full overflow-x-auto overflow-y-hidden overflow-lite  "> */}
        <ClinicCard.Categories
          categories={clinic.categories?.map((category) => category.name) || []}
        />
        {/* </div> */}
      </div>

      <ClinicCard.BookButton id={clinic.id?.toString()} />
    </ClinicCard>
  );
};
