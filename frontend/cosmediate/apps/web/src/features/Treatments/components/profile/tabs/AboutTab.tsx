"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  getClinicsByTreatmentIdApi,
  getTreatmentResultsApi,
} from "@cosmediate/api";
import type {
  Clinic,
  Treatment,
  TreatmentResult as TreatmentResultType,
} from "@cosmediate/type-utils";
import { TreatmentResultCard } from "@web/components/treatments/TreatmentResult/TreatmentResultCard";
import { tiptapJsonToHtml } from "@cosmediate/ui/modules/HtmlRichText/utils/tiptapToHtml";
import { SiteContainer, NoDataFound, Separator } from "@cosmediate/ui";
import HtmlViewer from "@cosmediate/ui/modules/HtmlRichText/HtmlViewer";
import { cn } from "@cosmediate/ui/lib/utils";

import { ClinicCard } from "@web/components/clinics/ClinicCard";
import { truncateText } from "@web/lib/utils";
import { normalizeTreatmentResultListFilters } from "@web/lib/filters/treatment-list-filters";
import { useTranslations } from "@cosmediate/i18n/client";

import { ChevronRight } from "lucide-react";

const AboutTab = ({
  setActiveTab,
  treatment,
}: {
  setActiveTab: (value: string) => void;
  treatment: Treatment;
}) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [treatmentResults, setTreatmentResults] = useState<
    TreatmentResultType[]
  >([]);
  const profile = useTranslations("profile");
  const common = useTranslations("common");
  const tags = useMemo(() => treatment?.tags || [], [treatment]);

  const fetchTreatmentClinics = useCallback(async () => {
    try {
      const response = await getClinicsByTreatmentIdApi({
        filters: {
          treatmentId: treatment.id,
        },
        sort: {
          by: "rating",
          order: "desc",
        },
        pagination: {
          limit: 5,
        },
      });

      if (response.success) {
        setClinics(response.items);
      }
    } catch (error) {
      console.error(error);
    }
  }, [treatment]);

  const fetchTreatmentResults = useCallback(async () => {
    try {
      const response = await getTreatmentResultsApi({
        filters: normalizeTreatmentResultListFilters({
          treatmentId: treatment.id,
        }),
        pagination: {
          limit: 20,
        },
      });

      if (response.success) {
        setTreatmentResults(response.items);
      }
    } catch (error) {
      console.error(error);
    }
  }, [treatment]);

  useEffect(() => {
    fetchTreatmentResults();
  }, [treatment, fetchTreatmentResults]);

  useEffect(() => {
    fetchTreatmentClinics();
  }, [treatment, fetchTreatmentClinics]);

  if (!treatment?.overview && !treatment?.htmlDescription) {
    return (
      <div className="w-full my-10 flex items-center justify-center">
        <NoDataFound
          message={profile.empty.treatment}
          description={common.pleaseTryAgainLater}
        />
      </div>
    );
  }

  return (
    <SiteContainer>
      <div
        className={cn(
          "w-full mt-8 mb-30 flex items-start justify-center gap-8",
          "max-lg:flex-col max-lg:gap-6 max-sm:gap-4"
        )}
      >
        <div className="w-[70%] max-xl:w-[60%] max-lg:w-full mb-20 max-lg:mb-10 flex flex-col items-start justify-start gap-6">
          <div className="w-full inline text-start text-700 text-wrap text-[27px] font-semibold leading-8 max-sm:text-[20px] max-sm:leading-[26px] capitalize">
            {profile.sections.treatmentGuideTitle(treatment?.name)}
          </div>

          {treatment?.overview && <Overview overview={treatment?.overview} />}

          <div className="w-full h-[550px] max-sm:h-[280px] rounded-2xl overflow-hidden">
            <Image
              height={1000}
              width={1000}
              src={treatment?.image}
              alt={treatment?.name}
              className="w-full h-full object-cover"
            />
          </div>

          {treatment?.htmlDescription && (
            <HtmlViewer html={tiptapJsonToHtml(treatment.htmlDescription)} />
          )}

          {tags?.length > 0 && <Tags tags={tags} />}

          {treatmentResults?.length > 0 && (
            <TreatmentResultsBeforeAfterImages
              treatmentResults={treatmentResults}
            />
          )}
        </div>

        <div
          className={cn(
            "w-[30%] max-xl:w-[40%] max-lg:w-full flex flex-col items-center justify-start"
          )}
        >
          <PopularClinics clinics={clinics} setActiveTab={setActiveTab} />
        </div>
      </div>
    </SiteContainer>
  );
};

const Overview = ({ overview }: { overview: string }) => {
  return (
    <div className="w-full flex items-start justify-start text-400 text-sm">
      {overview}
    </div>
  );
};

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="w-full inline-flex flex-wrap items-start justify-start gap-2 text-400 text-xs">
      {tags?.map((tag: string) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  );
};

const TreatmentResultsBeforeAfterImages = ({
  treatmentResults,
}: {
  treatmentResults: TreatmentResultType[];
}) => {
  const profile = useTranslations("profile");

  return (
    <div className="w-full flex flex-col items-start justify-start gap-6">
      <div className="font-bold text-700 text-sm leading-4">
        {profile.sections.treatmentResults}
      </div>

      <div className="w-[700px] max-xl:w-[500px] max-lg:w-full flex items-start justify-start gap-6 overflow-x-auto overflow-lite p-2">
        {treatmentResults?.map((result: TreatmentResultType, index: number) => (
          <TreatmentResultCard key={index} treatmentResults={result} />
        ))}
      </div>
    </div>
  );
};

const PopularClinics = ({
  clinics,
  setActiveTab,
}: {
  setActiveTab: (value: string) => void;
  clinics: Clinic[];
}) => {
  const profile = useTranslations("profile");
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center justify-start gap-7.5">
      <div className="w-full flex justify-between items-center">
        <div className="text-xl font-bold text-700 leading-6">
          {profile.sections.popularClinics}
        </div>

        {clinics?.length > 0 && (
          <div
            className="flex gap-2 items-center justify-center text-sm leading-5 text-600 hover:text-700 cursor-pointer"
            onClick={() => setActiveTab("clinics")}
          >
            <span>{profile.sections.seeMore}</span>
            <ChevronRight className="size-4" />
          </div>
        )}
      </div>

      <div
        className={cn("w-full flex flex-col items-start justify-center gap-4")}
      >
        {clinics.map((clinic, index) => (
          <div
            key={index}
            className={cn(
              "w-full flex flex-col items-start justify-center gap-4"
            )}
          >
            <ClinicCard
              onClick={() => router.push(`/clinics/${clinic.id}`)}
              className="w-full shrink-0 flex-row gap-4 cursor-pointer"
            >
              <div className="w-full flex flex-col items-start justify-start gap-1">
                <ClinicCard.Title
                  title={truncateText(clinic?.name, 20)}
                  variant="sm"
                  className="text-[13px]"
                />

                <div className="w-full flex items-start justify-start max-sm:flex-col gap-1">
                  <ClinicCard.Ratings
                    ratings={{
                      avgRating: clinic?.avgRating || 0,
                      reviewCount: clinic?.reviewCount || 0,
                    }}
                    className="w-[100px]"
                  />
                  <ClinicCard.Address
                    address={truncateText(clinic?.completeAddress, 30)}
                  />
                </div>
              </div>

              <ClinicCard.Logo
                logo={clinic?.logo}
                className={"border-none p-0 rounded-2xl overflow-hidden"}
              />
            </ClinicCard>

            <Separator className="w-full bg-200/80" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutTab;
