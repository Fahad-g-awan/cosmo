"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

import ServicesCard from "./components/ServicesCard";

import { MapPinned, FileSearchIcon } from "lucide-react";

const ServicesSection: React.FC = () => {
  return (
    <div className={cn("w-full px-2 max-lg:px-0")}>
      <div className={cn("w-full flex flex-col items-center")}>
        <div
          className={cn(
            "relative w-full rounded-2xl max-lg:rounded-none overflow-hidden"
          )}
        >
          <Content />

          <Image
            height={50}
            width={50}
            src="/home/services/left.svg"
            alt=""
            className="absolute left-[8.2%] max-xl:left-[8%] max-lg:left-[7.6%] bottom-0 size-4 z-20 max-sm:hidden"
          />

          <Image
            height={50}
            width={50}
            src="/home/services/right.svg"
            alt=""
            className="absolute bottom-0 left-[90.8%] size-4 z-20 max-sm:hidden"
          />
        </div>

        <ServicesCard />
      </div>
    </div>
  );
};

const Content = () => {
  const services = useTranslations("marketing").home.services;

  return (
    <>
      <Image
        src="/home/services/services-image.svg"
        alt={services.backgroundAlt}
        fill
        className="object-cover"
      />

      <div
        className={cn(
          "service-section-overlay absolute inset-x-0 bottom-0 h-[55%] z-10"
        )}
      />

      <div
        className={cn(
          "relative z-20 w-full flex flex-col items-center justify-end",
          "gap-10 max-lg:gap-6",
          "pt-[280px] pb-[140px]",
          "max-lg:pt-[180px] max-lg:pb-[120px]",
          "max-sm:pt-[100px] max-sm:pb-[80px]"
        )}
      >
        <div
          className={cn(
            "text-center font-bold text-white",
            "text-[50px] leading-[60px]",
            "max-lg:text-[34px] max-lg:leading-[41px]",
            "max-sm:text-[24px] max-sm:leading-[29px] max-sm:px-5"
          )}
        >
          {services.headingLine1} <br />
          {services.headingLine2}
        </div>

        <div
          className={cn(
            "flex items-center justify-center gap-8",
            "max-sm:flex-col max-sm:w-full max-sm:gap-3 max-sm:px-4"
          )}
        >
          <Button variant={"glass"} className="h-12 px-6 max-sm:w-[80%]">
            <Link
              href={"/home/clinics"}
              className="flex items-center gap-2.5 text-sm font-bold"
            >
              <MapPinned size={20} />
              <span>{services.exploreClinics}</span>
            </Link>
          </Button>

          <Button variant={"glass"} className="h-12 px-6 max-sm:w-[80%]">
            <Link
              href="/treatments"
              className="flex items-center gap-2.5 text-sm font-bold"
            >
              <FileSearchIcon size={20} />
              <span>{services.findTreatments}</span>
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default ServicesSection;
