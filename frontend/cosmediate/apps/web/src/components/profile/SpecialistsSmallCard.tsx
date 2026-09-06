"use client";

import React from "react";

import { Specialist } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { SpecialistCard } from "@web/components/specialists/SpecialistCard";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { useTranslations } from "@cosmediate/i18n/client";
import { truncateText } from "@web/lib/utils";

export const SpecialistSmallCard = ({
  specialist,
  ImageclassName,
}: {
  specialist: Specialist;
  ImageclassName?: string;
}) => {
  const { isMobileView } = useWindowWidth();
  const profile = useTranslations("profile");
  // const router = useRouter();

  return (
    <SpecialistCard
      // onClick={() => {
      //   router.push(`/specialists/${specialist?.id}`);
      // }}
      className={cn(
        "w-full flex-row max-sm:justify-between gap-6 max-lg:gap-4 max-sm:gap-3",
      )}
    >
      <div
        className={cn(
          "w-[112px] max-sm:w-[30%] flex items-center justify-center",
          ImageclassName,
        )}
      >
        <SpecialistCard.Avatar
          image={specialist?.image as string}
          className={cn("w-full")}
        />
      </div>

      <div className="w-full max-sm:w-[70%] flex items-center justify-between max-sm:flex-col max-sm:justify-center gap-4">
        <div
          className={cn("w-full flex flex-col items-start justify-start gap-1")}
        >
          <SpecialistCard.Name
            name={truncateText(specialist?.fullName, isMobileView ? 15 : 30)}
            variant="sm"
          />
          <SpecialistCard.Address
            address={truncateText(
              specialist?.completeAddress,
              isMobileView ? 35 : 60,
            )}
            label={profile.sections.specialistAt}
            className="w-full h-10"
          />
        </div>

        <div
          className={cn(
            "w-full sm:w-[200px] flex flex-col items-center justify-center max-sm:justify-between gap-2 max-sm:flex-row",
          )}
        >
          <SpecialistCard.Ratings
            avgRating={specialist?.avgRating as number}
            reviewCount={specialist?.reviewCount as number}
            className="gap-2 w-[100px]"
          />
          <SpecialistCard.BookButton
            label={profile.cards.explore}
            id={specialist.id}
          />
        </div>
      </div>
    </SpecialistCard>
  );
};
