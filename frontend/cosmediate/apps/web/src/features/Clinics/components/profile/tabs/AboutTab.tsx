"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@cosmediate/ui/components/carousel";
import { tiptapJsonToHtml } from "@cosmediate/ui/modules/HtmlRichText/utils/tiptapToHtml";
import HtmlViewer from "@cosmediate/ui/modules/HtmlRichText/HtmlViewer";
import { useTranslations } from "@cosmediate/i18n/client";
import { Clinic } from "@cosmediate/type-utils";
import { NoDataFound } from "@cosmediate/ui";

import TabsContainer from "@web/components/profile/TabsContainer";
import ContentCard from "../ContentCard";

const AboutTab = ({ clinic }: { clinic: Clinic }) => {
  const profile = useTranslations("profile");
  const common = useTranslations("common");
  const [api, setApi] = useState<CarouselApi>();

  const clinicImages = useMemo(() => clinic?.images || [], [clinic]);
  const tags = useMemo(() => clinic?.tags || [], [clinic]);

  const handlePrevious = () => {
    api?.scrollPrev();
  };

  const handleNext = () => {
    api?.scrollNext();
  };

  if (!clinic?.overview && !clinic?.htmlAbout) {
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
      {clinic?.overview && <Overview overview={clinic?.overview} />}
      {clinic?.htmlAbout && (
        <HtmlViewer html={tiptapJsonToHtml(clinic.htmlAbout)} />
      )}
      {tags && tags?.length > 0 && <Tags tags={tags} />}

      {clinicImages.length > 0 && (
        <ContentCard>
          <ContentCard.Header
            title={profile.sections.clinicPhotos}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
          />

          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full flex items-start justify-start gap-6"
          >
            <CarouselContent>
              {clinicImages?.map((image: string, index: number) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/3 basis-1/1"
                >
                  <div className="w-[250px] h-[150px] rounded-xl">
                    <Image
                      src={image || "./image.png"}
                      alt={profile.cards.clinicImageAlt}
                      width={500}
                      height={500}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </ContentCard>
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
      {tags?.map((tag: string) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  );
};

export default AboutTab;
