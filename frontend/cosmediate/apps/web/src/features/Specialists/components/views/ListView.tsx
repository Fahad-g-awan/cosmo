import { useRouter } from "next/navigation";
import React from "react";

import { Specialist } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { SpecialistCard } from "@web/components/specialists/SpecialistCard";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { useTranslations } from "@cosmediate/i18n/client";
import { truncateText } from "@web/lib/utils";

export const ListView = ({ specialist }: { specialist: Specialist }) => {
  const { isMobileView } = useWindowWidth();
  const profile = useTranslations("profile");
  const router = useRouter();

  return (
    <SpecialistCard
      onClick={() => {
        router.push(`/specialists/${specialist?.id}`);
      }}
      className={cn("w-full flex-row cursor-pointer")}
    >
      <SpecialistCard.Avatar image={specialist?.image as string} />

      <SpecialistCard className="w-[80%] gap-3">
        <div className={cn("w-full flex items-center justify-between")}>
          <SpecialistCard.Name
            name={truncateText(specialist?.fullName, isMobileView ? 15 : 30)}
            variant="sm"
          />
          <SpecialistCard.Ratings
            avgRating={specialist?.avgRating as number}
            reviewCount={specialist?.reviewCount as number}
            className="gap-4 max-sm:flex-row-reverse"
          />
        </div>
        <SpecialistCard.Address
          address={truncateText(
            specialist?.completeAddress,
            isMobileView ? 35 : 60,
          )}
          label={profile.sections.specialistAt}
          className="w-full h-10"
        />
      </SpecialistCard>
    </SpecialistCard>
  );
};
