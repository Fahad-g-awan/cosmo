import React from "react";

import { Specialist } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { SpecialistCard } from "@web/components/specialists/SpecialistCard";
import { useTranslations } from "@cosmediate/i18n/client";
import { truncateText } from "@web/lib/utils";

export const GridView = ({ specialist }: { specialist: Specialist }) => {
  const profile = useTranslations("profile");

  return (
    <SpecialistCard
      className={cn(
        "w-full h-full flex items-start justify-start gap-6 max-sm:flex-col max-sm:items-center",
      )}
    >
      <SpecialistCard.Avatar
        image={specialist?.image as string}
        containerClassName="w-full h-[220px] p-0 rounded-xl"
        className="rounded-xl"
      />

      <div className="w-full flex flex-col items-start justify-start gap-4">
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-2",
          )}
        >
          <SpecialistCard.Name
            name={truncateText(specialist?.fullName, 20)}
            variant="lg"
          />

          <div className="w-full flex flex-col items-start justify-start gap-1">
            <SpecialistCard.Ratings
              avgRating={specialist?.avgRating as number}
              reviewCount={specialist?.reviewCount as number}
              className="w-[100px]"
            />
            <SpecialistCard.Address
              address={truncateText(specialist?.completeAddress, 40)}
              // label="Cosmetic specialist at:"
            />
          </div>
        </div>

        {/* <SpecialistCard.TimeSlots
          slots={[
            "09:00",
            "10:00",
            "11:00",
            "12:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00",
          ]}
        /> */}
      </div>

      <SpecialistCard.BookButton
        className="self-start"
        id={specialist?.id}
        label={profile.cards.explore}
      />
    </SpecialistCard>
  );
};
