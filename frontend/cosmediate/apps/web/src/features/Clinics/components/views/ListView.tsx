import { useRouter } from "next/navigation";
import React from "react";

import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Clinic } from "@cosmediate/type-utils";

import { ClinicCard } from "@web/components/clinics/ClinicCard";
import { truncateText } from "@web/lib/utils";

export const ListView = ({ clinic }: { clinic: Clinic }) => {
  const { isMobileView } = useWindowWidth();
  const router = useRouter();

  return (
    <ClinicCard
      onClick={() => {
        router.push(`/clinics/${clinic.id?.toString()}`);
      }}
      className="w-full flex-row gap-4 cursor-pointer overflow-hidden"
    >
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <ClinicCard.Title
          title={truncateText(clinic.name, isMobileView ? 20 : 40)}
          variant="sm"
          className="text-[13px]"
        />

        <div className="w-full flex max-sm:flex-col items-center justify-start max-sm:items-start gap-4 max-sm:gap-2">
          <ClinicCard.Ratings
            ratings={{
              avgRating: clinic.avgRating || 0,
              reviewCount: clinic.reviewCount || 0,
            }}
            className="w-fit"
          />
          <ClinicCard.Address
            address={truncateText(
              clinic.completeAddress,
              isMobileView ? 30 : 60
            )}
            className="w-full"
          />
        </div>

        <div className="w-[400px] max-xl:w-[550px] max-sm:w-[200px] overflow-x-auto overflow-lite pb-2">
          <ClinicCard.Categories
            categories={
              clinic.categories?.map((category) => category.name) || []
            }
            className="w-max"
          />
        </div>
      </div>

      <ClinicCard.Logo logo={clinic?.logo} />
    </ClinicCard>
  );
};
