"use client";

import React, { useCallback, useEffect, useState } from "react";

import {
  getClinicsApi,
  getSubTreatmentsApi,
  listClinicSpecialistTreatmentsApi,
} from "@cosmediate/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cosmediate/ui/components/accordion";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Clinic, Specialist, SubTreatment } from "@cosmediate/type-utils";
import { Separator } from "@cosmediate/ui/components/separator";
import { cn } from "@cosmediate/ui/lib/utils";
import { NoDataFound, SmallLoader } from "@cosmediate/ui";

import TabsContainer from "@web/components/profile/TabsContainer";
import { useTranslations } from "@cosmediate/i18n/client";
import { LIST_MAX_LIMIT } from "@web/lib/list-pagination";
import { truncateText } from "@web/lib/utils";

import { Minus, Plus } from "lucide-react";

type SubTreatmentRow = SubTreatment & {
  categoryName?: string;
};

type ClinicPriceGroup = {
  clinicId: string;
  clinicName: string;
  subTreatments: SubTreatmentRow[];
};

const fetchSpecialistClinicPriceGroups = async (
  specialistId: string,
): Promise<ClinicPriceGroup[]> => {
  const assignments: { clinicId: string; clinicTreatmentId: string }[] = [];
  let nextToken: string | undefined;

  do {
    const response = await listClinicSpecialistTreatmentsApi({
      filters: { specialistId },
      pagination: { limit: LIST_MAX_LIMIT, nextToken },
    });

    if (!response.success) break;

    assignments.push(
      ...response.items.map((item) => ({
        clinicId: item.clinicId,
        clinicTreatmentId: item.clinicTreatmentId,
      })),
    );
    nextToken = response.nextToken ?? undefined;
  } while (nextToken);

  const clinicTreatmentIds = [
    ...new Set(assignments.map((item) => item.clinicTreatmentId)),
  ];

  if (!clinicTreatmentIds.length) return [];

  const clinics: Clinic[] = [];
  nextToken = undefined;

  do {
    const response = await getClinicsApi({
      filters: { specialistId },
      pagination: { limit: LIST_MAX_LIMIT, nextToken },
    });

    if (!response.success) break;

    clinics.push(...(response.items as Clinic[]));
    nextToken = response.nextToken ?? undefined;
  } while (nextToken);

  const clinicNameById = new Map(
    clinics.map((clinic) => [clinic.id, clinic.name]),
  );
  const allowedClinicTreatmentIds = new Set(clinicTreatmentIds);

  const subTreatments: SubTreatmentRow[] = [];
  nextToken = undefined;

  do {
    const response = await getSubTreatmentsApi({
      filters: { clinicTreatmentIds },
      sort: { by: "categoryName", order: "asc" },
      pagination: { limit: LIST_MAX_LIMIT, nextToken },
    });

    if (!response.success) break;

    subTreatments.push(...response.items);
    nextToken = response.nextToken ?? undefined;
  } while (nextToken);

  const filtered = subTreatments.filter((item) =>
    allowedClinicTreatmentIds.has(item.clinicTreatmentId ?? ""),
  );

  const byClinic = new Map<string, SubTreatmentRow[]>();

  for (const item of filtered) {
    const clinicId = item.clinicId ?? "unknown";
    if (!byClinic.has(clinicId)) {
      byClinic.set(clinicId, []);
    }
    byClinic.get(clinicId)!.push(item);
  }

  return Array.from(byClinic.entries())
    .map(([clinicId, items]) => ({
      clinicId,
      clinicName: clinicNameById.get(clinicId) ?? "Clinic",
      subTreatments: items,
    }))
    .sort((a, b) => a.clinicName.localeCompare(b.clinicName));
};

const PriceTab = ({ specialist }: { specialist: Specialist }) => {
  const profile = useTranslations("profile");
  const common = useTranslations("common");
  const [clinicGroups, setClinicGroups] = useState<ClinicPriceGroup[]>([]);
  const [openClinics, setOpenClinics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      const groups = await fetchSpecialistClinicPriceGroups(specialist.id);
      setClinicGroups(groups);
      setOpenClinics(groups.map((group) => group.clinicId));
    } catch (error) {
      console.error(error);
      setClinicGroups([]);
      setOpenClinics([]);
    } finally {
      setIsLoading(false);
    }
  }, [specialist.id]);

  useEffect(() => {
    void fetchPrices();
  }, [fetchPrices]);

  if (isLoading) {
    return (
      <div className="w-full my-10 flex items-center justify-center">
        <SmallLoader showText={false} />
      </div>
    );
  }

  if (clinicGroups.length < 1) {
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

        <Accordion
          type="multiple"
          className="w-full bg-gray-card rounded-lg"
          value={openClinics}
          onValueChange={setOpenClinics}
        >
          {clinicGroups.map((group) => (
            <AccordionItem
              key={group.clinicId}
              value={group.clinicId}
              className="w-full group border-none"
            >
              <AccordionTrigger
                className={cn(
                  "cursor-pointer w-full flex justify-between items-center gap-3 p-6 transition-all duration-300",
                  "group-data-[state=open]:bg-white group-data-[state=open]:font-semibold group-data-[state=open]:rounded-t-lg [&>svg]:hidden hover:no-underline",
                )}
              >
                <div className="w-full capitalize text-lg max-sm:text-base font-medium text-700">
                  {group.clinicName} ({group.subTreatments.length})
                </div>

                <div className="transition-all w-5 h-5 text-primary-accent">
                  <Plus className="group-data-[state=open]:hidden" />
                  <Minus className="hidden group-data-[state=open]:block" />
                </div>
              </AccordionTrigger>

              <AccordionContent className="w-full bg-white group-data-[state=open]:rounded-b-lg px-6 py-4">
                <div className="w-full grid grid-cols-2 gap-x-8 gap-y-4 max-lg:grid-cols-1">
                  {group.subTreatments.map((subTreatment) => (
                    <SubTreatmentCard
                      key={subTreatment.id}
                      subTreatment={subTreatment}
                      label={subTreatment.categoryName}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
