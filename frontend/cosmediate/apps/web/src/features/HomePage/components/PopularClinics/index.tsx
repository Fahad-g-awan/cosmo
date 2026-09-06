"use client";

import Autoplay from "embla-carousel-autoplay";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  SiteContainer,
  ClinicsLoader,
} from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";
import { Clinic } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { ClinicCard } from "@web/components/clinics/ClinicCard";
import { truncateText } from "@web/lib/utils";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PopularClinicsProps {
  clinics: Clinic[];
  isLoading: boolean;
}

const PopularClinics = ({ clinics, isLoading }: PopularClinicsProps) => {
  const home = useTranslations("marketing").home;
  const [api, setApi] = useState<CarouselApi>();
  const plugin = React.useRef(
    Autoplay({
      // Speed
      delay: 3000,
      stopOnInteraction: true,
    })
  );

  const handlePrevious = () => {
    api?.scrollPrev();
    plugin.current?.reset();
  };

  const handleNext = () => {
    api?.scrollNext();
    plugin.current?.reset();
  };

  const showClinics = clinics.length > 0 && !isLoading;
  const showLoader = clinics.length < 1 && isLoading;

  if (!showClinics && !showLoader) return <div></div>;

  return (
    <SiteContainer className="mb-10">
      {showClinics && (
        <div className="w-full flex justify-between items-center mb-[26px]">
          <div className="text-900 font-bold text-[20px] leading-[24px]">
            {home.popularClinics}
          </div>

          <div className="flex gap-2">
            <ChevronLeft
              className="w-5 h-5 text-300 hover:text-900 cursor-pointer"
              onClick={handlePrevious}
            />
            <ChevronRight
              className="w-5 h-5 text-300 hover:text-900 cursor-pointer"
              onClick={handleNext}
            />
          </div>
        </div>
      )}

      {showLoader && <ClinicsLoader />}

      {showClinics && (
        <Carousel
          setApi={setApi}
          plugins={[
            Autoplay({
              delay: 5000, // Increased delay to give user more time to read
              stopOnInteraction: true,
            }),
          ]}
          opts={{
            loop: true,
            align: "start",
            duration: 5000, // Reduced animation duration
            dragFree: false,
          }}
          className={cn("w-full container")}
        >
          <CarouselContent className="w-full flex items-center justify-start gap-9 pl-5">
            {clinics.map((clinic, index) => (
              <CarouselItem
                key={`${clinic.id}-${index}`}
                className="md:basis-1/2 lg:basis-1/4 basis-1/1 p-0"
              >
                <RenderClinicCard clinic={clinic} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </SiteContainer>
  );
};

const RenderClinicCard = ({ clinic }: { clinic: Clinic }) => {
  const router = useRouter();

  return (
    <ClinicCard
      onClick={() => router.push(`/clinics/${clinic?.id?.toString()}`)}
      className="w-full gap-4 shadow py-3 px-4 my-2 rounded-xl bg-cloud/10 cursor-pointer"
    >
      <ClinicCard.Logo logo={clinic?.logo} />

      <div className="w-full flex flex-col items-start justify-start gap-1">
        <ClinicCard.Title
          title={truncateText(clinic.name, 40)}
          variant="sm"
          className="text-[13px]"
        />
        <ClinicCard.Address
          address={truncateText(clinic.completeAddress, 40)}
        />
      </div>

      <ClinicCard.Ratings
        ratings={{
          avgRating: clinic.avgRating || 0,
          reviewCount: clinic.reviewCount || 0,
        }}
      />
    </ClinicCard>
  );
};

export default PopularClinics;
