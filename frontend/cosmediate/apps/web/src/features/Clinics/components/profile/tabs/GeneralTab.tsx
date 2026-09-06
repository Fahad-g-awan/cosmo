"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  getSpecialistsApi,
  getTreatmentResultsApi,
  listClinicSpecialistTreatmentsApi,
} from "@cosmediate/api";
import {
  Clinic,
  Treatment,
  Specialist,
  TreatmentResult as TreatmentResultType,
  Certificates,
  ProfileTreatmentAssignment,
  ClinicSpecialistTreatment,
  JSONContentType,
} from "@cosmediate/type-utils";
import { tiptapJsonToHtml } from "@cosmediate/ui/modules/HtmlRichText/utils/tiptapToHtml";
import HtmlViewer from "@cosmediate/ui/modules/HtmlRichText/HtmlViewer";
import { Separator } from "@cosmediate/ui/components/separator";
import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";
import { NoDataFound } from "@cosmediate/ui";

import { TreatmentResultCard } from "@web/components/treatments/TreatmentResult/TreatmentResultCard";
import { TreatmentsSmallCard } from "@web/components/profile/TreatmentsSmallCard";
import { SpecialistSmallCard } from "@web/components/profile/SpecialistsSmallCard";
import { CertificateCard } from "@web/components/profile/CertificateCard";
import TabsContainer from "@web/components/profile/TabsContainer";
import ReviewsComp from "../components/ReviewsComp";
import ContentCard from "../ContentCard";
import { normalizeTreatmentResultListFilters } from "@web/lib/filters/treatment-list-filters";

import { ChevronRight } from "lucide-react";

const dedupeTopTreatmentsByTreatmentId = (
  items: ClinicSpecialistTreatment[],
  limit: number,
): ProfileTreatmentAssignment[] => {
  const seen = new Set<string>();
  const result: ProfileTreatmentAssignment[] = [];

  for (const item of items) {
    if (seen.has(item.treatmentId)) continue;
    seen.add(item.treatmentId);

    result.push({
      id: item.id,
      clinicTreatmentId: item.clinicTreatmentId,
      treatmentId: item.treatmentId,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      treatmentName: item.treatmentName,
      treatmentImage: item.treatmentImage ?? undefined,
      treatmentOverview: item.treatmentOverview ?? undefined,
      minPrice: item.minPrice,
    });

    if (result.length >= limit) break;
  }

  return result;
};

const GeneralTab = ({
  setActiveTab,
  clinic,
}: {
  setActiveTab: (value: string) => void;
  clinic: Clinic;
}) => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [treatments, setTreatments] = useState<ProfileTreatmentAssignment[]>(
    [],
  );
  const [treatmentResults, setTreatmentResults] = useState<
    TreatmentResultType[]
  >([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const profile = useTranslations("profile");
  const common = useTranslations("common");

  const certificates = useMemo(() => clinic?.certificates, [clinic]);
  const tags = useMemo(() => clinic?.tags || [], [clinic]);

  const fetchClinicSpecialists = useCallback(async () => {
    try {
      const response = await getSpecialistsApi({
        filters: {
          clinicId: clinic.id,
        },
        sort: {
          by: "rating",
          order: "desc",
        },
        pagination: {
          limit: 3,
        },
      });

      if (response.success) {
        setSpecialists(response.items as Specialist[]);
      }
    } catch (error) {
      console.error(error);
    }
  }, [clinic.id]);

  const fetchPopularTreatments = useCallback(async () => {
    try {
      const response = await listClinicSpecialistTreatmentsApi({
        filters: {
          clinicId: clinic.id,
          allowZeroSearchClicks: true,
        },
        sort: {
          by: "searchClicks",
          order: "desc",
        },
        pagination: {
          limit: 6,
        },
      });

      if (response.success) {
        setTreatments(dedupeTopTreatmentsByTreatmentId(response.items, 3));
      }
    } catch (error) {
      console.error(error);
    }
  }, [clinic.id]);

  const fetchTreatmentResults = useCallback(async () => {
    try {
      const response = await getTreatmentResultsApi({
        filters: normalizeTreatmentResultListFilters({
          clinicId: clinic.id,
        }),
        pagination: {
          limit: 10,
        },
      });

      if (response.success) {
        setTreatmentResults(response.items);
      }
    } catch (error) {
      console.error(error);
    }
  }, [clinic.id]);

  useEffect(() => {
    let cancelled = false;

    const loadRelated = async () => {
      setIsLoadingRelated(true);
      await Promise.all([
        fetchClinicSpecialists(),
        fetchPopularTreatments(),
        fetchTreatmentResults(),
      ]);
      if (!cancelled) {
        setIsLoadingRelated(false);
      }
    };

    void loadRelated();

    return () => {
      cancelled = true;
    };
  }, [fetchClinicSpecialists, fetchPopularTreatments, fetchTreatmentResults]);

  const trimmedHtmlContent = useMemo(() => {
    const html = clinic?.htmlAbout;

    if (
      !html ||
      typeof html !== "object" ||
      !("content" in html) ||
      !Array.isArray((html as any).content) ||
      (html as any).content.length < 1
    ) {
      return null;
    }

    const typedHtml = html as JSONContentType;

    return {
      ...typedHtml,
      content: typedHtml.content?.slice(0, 2),
    };
  }, [clinic]);

  if (
    !isLoadingRelated &&
    !clinic?.overview &&
    !clinic?.htmlAbout &&
    treatments.length < 1 &&
    (certificates || []).length < 1 &&
    specialists.length < 1 &&
    treatmentResults.length < 1
  ) {
    return (
      <div className="w-full my-10 flex items-center justify-center">
        <NoDataFound
          message={profile.empty.clinic}
          description={common.pleaseTryAgainLater}
        />
      </div>
    );
  }

  return (
    <TabsContainer>
      <div className="w-full flex flex-col items-start justify-center gap-2">
        {clinic?.overview && <Overview overview={clinic?.overview} />}
        {trimmedHtmlContent && (
          <HtmlViewer html={tiptapJsonToHtml(trimmedHtmlContent)} />
        )}

        {trimmedHtmlContent && (
          <div
            className="w-fit mb-3 flex items-center justify-start gap-1 text-500 hover:text-700 cursor-pointer text-sm leading-5 transition-all duration-300"
            onClick={() => setActiveTab("about")}
          >
            <span className="">{profile.sections.readMore}</span>
            <ChevronRight className="size-4 opacity-90" />
          </div>
        )}

        {tags && tags?.length > 0 && <Tags tags={tags} />}
      </div>

      {certificates && certificates?.length > 0 && (
        <Certifications certificates={certificates || []} />
      )}
      {treatments.length > 0 && (
        <PopularTreatments
          setActiveTab={setActiveTab}
          treatments={treatments}
        />
      )}
      {specialists.length > 0 && (
        <ClinicDoctors setActiveTab={setActiveTab} specialists={specialists} />
      )}
      {treatmentResults.length > 0 && (
        <TreatmentResultsBeforeAfterImages
          treatmentResults={treatmentResults}
        />
      )}
      {(clinic?.reviewCount ?? 0) > 0 && <ClinicReviews clinic={clinic} />}
    </TabsContainer>
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

const Certifications = ({ certificates }: { certificates: Certificates[] }) => {
  const profile = useTranslations("profile");

  return (
    <div className="w-full flex flex-col items-start justify-start gap-6">
      <div className="font-bold text-700 text-sm leading-4">
        {profile.sections.qualityMarks}
      </div>

      <div className="w-[700px] max-xl:w-[500px] max-lg:w-full flex items-start justify-start gap-6 overflow-x-auto overflow-lite p-2">
        {certificates &&
          (certificates || []).map((item, index: number) => {
            return <CertificateCard key={index} item={item} />;
          })}
      </div>
    </div>
  );
};

const PopularTreatments = ({
  setActiveTab,
  treatments,
}: {
  setActiveTab: (value: string) => void;
  treatments: ProfileTreatmentAssignment[];
}) => {
  const profile = useTranslations("profile");

  return (
    <ContentCard>
      <ContentCard.Header
        title={profile.sections.popularTreatments}
        viewAllClick={() => setActiveTab("treatments")}
      />

      <div
        className={cn(
          "w-full max-xl:w-[500px] max-lg:w-full flex items-start justify-start gap-6 overflow-x-auto overflow-lite p-2",
        )}
      >
        {treatments.map((treatment: ProfileTreatmentAssignment) => {
          const cardTreatment = {
            id: treatment.treatmentId,
            name: treatment.treatmentName,
            image: treatment.treatmentImage ?? "",
            overview: treatment.treatmentOverview ?? "",
            minPrice: treatment.minPrice,
          } satisfies Pick<
            Treatment,
            "id" | "name" | "image" | "overview" | "minPrice"
          >;

          return (
            <TreatmentsSmallCard
              key={treatment.id}
              treatment={cardTreatment as Treatment}
              category={treatment.categoryName ?? ""}
            />
          );
        })}
      </div>
    </ContentCard>
  );
};

const ClinicDoctors = ({
  setActiveTab,
  specialists,
}: {
  setActiveTab: (value: string) => void;
  specialists: Specialist[];
}) => {
  const profile = useTranslations("profile");

  return (
    <ContentCard>
      <ContentCard.Header
        title={profile.sections.doctors}
        viewAllClick={() => setActiveTab("doctors")}
      />

      <div className="w-full flex flex-col items-center justify-start gap-6">
        {specialists?.map((specialist: Specialist, index: number) => (
          <div
            key={index}
            className="w-full flex flex-col items-center justify-start gap-6"
          >
            <SpecialistSmallCard specialist={specialist as Specialist} />
            {index < specialists.length - 1 && <Separator className="w-full" />}
          </div>
        ))}
      </div>
    </ContentCard>
  );
};

const TreatmentResultsBeforeAfterImages = ({
  treatmentResults,
}: {
  treatmentResults: TreatmentResultType[];
}) => {
  const profile = useTranslations("profile");

  return (
    <ContentCard>
      <ContentCard.Header title={profile.sections.beforeAfterPhotos} />
      <div className="w-full max-xl:w-[500px] max-lg:w-full flex items-start justify-start gap-6 overflow-x-auto overflow-lite p-2">
        {treatmentResults?.map((result: TreatmentResultType, index: number) => (
          <TreatmentResultCard key={index} treatmentResults={result} />
        ))}
      </div>
    </ContentCard>
  );
};

const ClinicReviews = ({ clinic }: { clinic: Clinic }) => {
  return (
    <ContentCard>
      <ReviewsComp clinic={clinic} showMinimal />
    </ContentCard>
  );
};

export default GeneralTab;
