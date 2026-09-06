"use client";

import React from "react";
import Link from "next/link";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

const PrivacyPolicy = () => {
  const privacy = useTranslations("forms").privacy;

  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-2 italic p-5 bg-ghost-blue-2 rounded-2xl max-sm:p-4"
      )}
    >
      <div className="w-full flex items-center justify-start text-start text-sm leading-[22px] text-700 font-medium">
        {privacy.title}
      </div>
      <p className={cn("w-full text-start text-xs leading-[18px] text-600")}>
        {privacy.textBeforeLink}
        <Link
          href={"/privacy-policy"}
          target="_blank"
          className="inline-block text-primary-accent/80 hover:text-primary-accent-dark underline underline-offset-4"
        >
          {privacy.linkLabel}
        </Link>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
