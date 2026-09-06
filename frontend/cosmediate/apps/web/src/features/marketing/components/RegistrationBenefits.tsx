"use client";

import Image from "next/image";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import type { RegisterBenefit, RegisterType } from "../types/register";
import { useRegisterPageData } from "../hooks/useMarketingPageData";

const RegistrationTextArea = ({
  registrationType,
}: {
  registrationType: RegisterType;
}) => {
  const pageData = useRegisterPageData(registrationType);
  const shared = useTranslations("marketing").shared;
  const benefitsHeading =
    registrationType === "clinic"
      ? shared.benefitsHeadingRegisterClinic
      : shared.benefitsHeadingRegisterDoctor;

  return (
    <div
      className={cn(
        "w-full h-full bg-ghost-blue flex flex-col items-center justify-center gap-9 max-sm:gap-4 rounded-2xl",
        "px-14 py-16 max-sm:px-4 max-sm:py-4"
      )}
    >
      <div
        className={cn(
          "w-full text-[32px] leading-[38px] text-700 font-bold",
          "max-xl:text-[28px] max-sm:text-2xl max-sm:leading-[28px]"
        )}
      >
        {pageData.title}
      </div>

      <div className="w-full flex flex-col items-start justify-center gap-6">
        <p className={cn("text-700 text-[20px] leading-[26px] font-semibold")}>
          {benefitsHeading}
        </p>

        <div
          className={cn(
            "grid grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-8"
          )}
        >
          {pageData.benefits.map((benefit, index) => (
            <BenefitItem key={index} item={benefit} />
          ))}
        </div>
      </div>

      <h1
        className={cn(
          "text-xl text-700 leading-[26px] font-semibold max-sm:text-[16px]  max-sm:leading-[24px]"
        )}
      >
        {shared.registerFollowUp}
      </h1>
    </div>
  );
};

const BenefitItem = ({ item }: { item: RegisterBenefit }) => {
  const shared = useTranslations("marketing").shared;

  return (
    <div className={cn("flex items-center justify-start gap-2")}>
      <Image
        src={item?.image || "/image.jpg"}
        alt={shared.benefitImageAlt}
        width={32}
        height={32}
        quality={100}
      />
      <h1 className={cn("text-sm text-900 leading-[21px]")}>{item?.title}</h1>
    </div>
  );
};

export default RegistrationTextArea;
