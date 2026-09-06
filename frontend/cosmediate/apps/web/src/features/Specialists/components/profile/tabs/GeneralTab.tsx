"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { getClinicsApi } from "@cosmediate/api";
import { tiptapJsonToHtml } from "@cosmediate/ui/modules/HtmlRichText/utils/tiptapToHtml";
import {
  Certificates,
  Clinic,
  JSONContentType,
  Specialist,
} from "@cosmediate/type-utils";
import HtmlViewer from "@cosmediate/ui/modules/HtmlRichText/HtmlViewer";
import { NoDataFound, SmallLoader } from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";

import { CertificateCard } from "@web/components/profile/CertificateCard";
import { ClinicSmallCard } from "@web/components/profile/ClinicSmallCard";
import TabsContainer from "@web/components/profile/TabsContainer";
import { LIST_MAX_LIMIT } from "@web/lib/list-pagination";

import { ChevronRight } from "lucide-react";

const fetchSpecialistClinics = async (specialistId: string) => {
  const items: Clinic[] = [];
  let nextToken: string | undefined;

  do {
    const response = await getClinicsApi({
      filters: { specialistId },
      sort: { by: "rating", order: "desc" },
      pagination: { limit: LIST_MAX_LIMIT, nextToken },
    });

    if (!response.success) break;

    items.push(...(response.items as Clinic[]));
    nextToken = response.nextToken ?? undefined;
  } while (nextToken);

  return items;
};

const GeneralTab = ({
  specialist,
  setActiveTab,
}: {
  specialist: Specialist;
  setActiveTab: (value: string) => void;
}) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const profile = useTranslations("profile");
  const common = useTranslations("common");

  const fetchClinics = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await fetchSpecialistClinics(specialist.id);
      setClinics(items);
    } catch (error) {
      console.error(error);
      setClinics([]);
    } finally {
      setIsLoading(false);
    }
  }, [specialist.id]);

  useEffect(() => {
    void fetchClinics();
  }, [fetchClinics]);

  const trimmedHtmlContent = useMemo(() => {
    const html = specialist?.htmlAbout;

    if (
      !html ||
      typeof html !== "object" ||
      !("content" in html) ||
      !Array.isArray((html as JSONContentType).content) ||
      (html as JSONContentType).content!.length < 1
    ) {
      return null;
    }

    const typedHtml = html as JSONContentType;

    return {
      ...typedHtml,
      content: typedHtml.content?.slice(0, 2),
    };
  }, [specialist]);

  const certificates = useMemo(
    () => specialist?.certificates || null,
    [specialist],
  );
  const tags = useMemo(() => specialist?.tags || [], [specialist]);

  if (isLoading) {
    return (
      <div className="w-full my-10 flex items-center justify-center">
        <SmallLoader showText={false} />
      </div>
    );
  }

  if (
    !specialist?.overview &&
    !specialist?.htmlAbout &&
    clinics.length === 0 &&
    (certificates?.length ?? 0) === 0
  ) {
    return (
      <div className="w-full my-10 flex items-center justify-center">
        <NoDataFound
          message={profile.empty.specialist}
          description={common.pleaseTryAgainLater}
        />
      </div>
    );
  }

  return (
    <TabsContainer>
      <div className="w-full flex flex-col items-start justify-center gap-2">
        {specialist?.overview && <Overview overview={specialist?.overview} />}
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

        {tags.length > 0 && <Tags tags={tags} />}
      </div>

      {clinics.length > 0 && <AssociatedClinics clinics={clinics} />}
      {certificates && certificates.length > 0 && (
        <Certifications certificates={certificates} />
      )}
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
      {tags.map((tag: string) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  );
};

const AssociatedClinics = ({ clinics }: { clinics: Clinic[] }) => {
  const profile = useTranslations("profile");
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-start justify-start gap-6">
      <div className="font-bold text-700 text-sm leading-4">
        {profile.sections.workingAt}
      </div>

      <div className="w-[700px] max-xl:w-[500px] max-lg:w-full flex items-start justify-start gap-4 overflow-x-auto overflow-lite p-2">
        {clinics.map((clinic) => (
          <ClinicSmallCard
            key={clinic.id}
            onClick={() => router.push(`/clinics/${clinic.id}`)}
            clinic={clinic}
          />
        ))}
      </div>
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
        {certificates.map((item, index) => (
          <CertificateCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default GeneralTab;
