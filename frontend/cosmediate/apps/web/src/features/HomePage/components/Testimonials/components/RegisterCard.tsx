"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

const RegisterCard = () => {
  const testimonials = useTranslations("marketing").home.testimonials;

  return (
    <div
      className={cn(
        "w-[35%] max-lg:w-full h-[500px] bg-ghost-blue rounded-2xl",
        "flex flex-col justify-center items-start gap-4 max-lg:items-center p-6 max-sm:px-3 max-sm:py-5 max-lg:py-[24px]"
      )}
    >
      <Image
        src="/home/testimonials/Outline_12.svg"
        alt={testimonials.registerImageAlt}
        className="max-sm:w-[100px] max-sm:h-[100px]"
        width={128}
        height={128}
      />

      <div
        className={cn(
          "w-full flex flex-col justify-center items-start gap-4 max-lg:items-center max-lg:text-center "
        )}
      >
        <h2
          className={cn(
            "w-full flex flex-col items-start justify-start gap-2 max-lg:flex-row max-sm:flex-col max-lg:justify-center max-lg:items-center",
            "text-[27px] leading-[30px] text-800 font-semibold max-sm:text-center"
          )}
        >
          <span>{testimonials.registerTitleLine1}</span>{" "}
          <span>{testimonials.registerTitleLine2}</span>
        </h2>
        <p className="text-700 text-[16px] leading-[24px] font-medium">
          {testimonials.registerBody1}
        </p>
        <p className="text-700 text-[12px] leading-[16.8px] font-medium ">
          {testimonials.registerBody2}
        </p>
      </div>

      <Button
        variant="outline"
        className="bg-none text-primary-accent hover:text-primary-accent/80"
      >
        <Link href={"/home/vacancies"}>{testimonials.registerCta}</Link>
      </Button>
    </div>
  );
};

export default RegisterCard;
