"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import { usePartnerPageData } from "../../hooks/useMarketingPageData";
import InfoCard from "../InfoCard";

const contactItems = [
  { href: "/auth/signup" },
  { href: "/contact" },
] as const;

const ContactUsSection = () => {
  const { contactData } = usePartnerPageData();
  const shared = useTranslations("marketing").shared;

  return (
    <div
      className={cn(
        "w-full grid grid-cols-3 max-lg:grid-cols-1 items-center justify-center gap-8 max-sm:gap-4",
        "max-lg:flex-col"
      )}
    >
      {contactData.map((item, index) => {
        const className =
          index === 0 ? "col-span-2 max-lg:col-span-1" : "col-span-1";

        return (
          <InfoCard
            key={index}
            className={cn(className)}
            image={item.image}
            title={item.title}
            description={item.paragraphs}
            href={contactItems[index]?.href}
            linkLabel={
              index === 0 ? shared.signUp : shared.contactUsNow
            }
          />
        );
      })}
    </div>
  );
};

export default ContactUsSection;
