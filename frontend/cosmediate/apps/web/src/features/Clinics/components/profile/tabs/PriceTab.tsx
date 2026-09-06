"use client";

import React, { useCallback, useEffect, useState } from "react";

import { getSubTreatmentsApi } from "@cosmediate/api";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Separator } from "@cosmediate/ui/components/separator";
import { Clinic, SubTreatment } from "@cosmediate/type-utils";
import { useTranslations } from "@cosmediate/i18n/client";
import { NoDataFound, SmallLoader } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import TabsContainer from "@web/components/profile/TabsContainer";
import { truncateText } from "@web/lib/utils";

const LIST_MAX_LIMIT = 100;

type SubTreatmentRow = SubTreatment & {
  categoryName?: string;
};

const fetchAllClinicSubTreatments = async (clinicId: string) => {
  const items: SubTreatmentRow[] = [];
  let nextToken: string | undefined;

  do {
    const response = await getSubTreatmentsApi({
      filters: { clinicId },
      sort: { by: "categoryName", order: "asc" },
      pagination: { limit: LIST_MAX_LIMIT, nextToken },
    });

    if (!response.success) break;

    items.push(...response.items);
    nextToken = response.nextToken ?? undefined;
  } while (nextToken);

  return items;
};

const PriceTab = ({ clinic }: { clinic: Clinic }) => {
  const profile = useTranslations("profile");
  const common = useTranslations("common");
  const [subTreatments, setSubTreatments] = useState<SubTreatmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubTreatments = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await fetchAllClinicSubTreatments(clinic.id);
      setSubTreatments(items);
    } catch (error) {
      console.error(error);
      setSubTreatments([]);
    } finally {
      setIsLoading(false);
    }
  }, [clinic.id]);

  useEffect(() => {
    void fetchSubTreatments();
  }, [fetchSubTreatments]);

  if (isLoading) {
    return (
      <div className="w-full my-30 flex items-center justify-center">
        <SmallLoader showText={false} />
      </div>
    );
  }

  if (subTreatments.length < 1) {
    return (
      <div className="w-full my-10 flex items-center justify-center">
        <NoDataFound
          message={profile.empty.treatments}
          description={common.pleaseTryAgainLater}
        />
      </div>
    );
  }

  return (
    <TabsContainer>
      <div className="flex flex-col items-start justify-center w-full bg-gray-card rounded-2xl p-2">
        <div className="text-xl text-700 font-bold leading-6 py-4 px-6">
          {profile.sections.price}
        </div>

        <div className="w-full bg-white rounded-lg px-6 py-4">
          <div className="w-full grid grid-cols-2 gap-x-8 gap-y-4 max-lg:grid-cols-1">
            {subTreatments.map((subTreatment) => (
              <SubTreatmentCard
                key={subTreatment.id}
                subTreatment={subTreatment}
                label={subTreatment.categoryName}
              />
            ))}
          </div>
        </div>
      </div>
    </TabsContainer>
  );
};

const SubTreatmentCard = ({
  subTreatment,
  label,
}: {
  subTreatment: SubTreatment;
  label?: string;
}) => {
  const { isXLScreen, isTabletView, isMobileView } = useWindowWidth();

  return (
    <div
      className={cn("w-full flex flex-col items-center justify-center gap-4")}
    >
      <div className="w-full flex items-center justify-between gap-2">
        <div className="capitalize text-xs text-500 font-medium leading-[16px]">
          {truncateText(
            `${label ? `${label} — ` : ""}${subTreatment?.name ?? ""}`,
            isXLScreen ? 28 : isTabletView ? 80 : isMobileView ? 28 : 40,
          )}
        </div>

        <div className="text-xs text-700 font-bold leading-[16px]">
          €{subTreatment?.price}
        </div>
      </div>

      <Separator className="w-full bg-200/70" />
    </div>
  );
};

export default PriceTab;
