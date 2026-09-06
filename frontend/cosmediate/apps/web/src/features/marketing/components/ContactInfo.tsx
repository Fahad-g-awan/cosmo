"use client";

import Image from "next/image";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

const ContactInfo = ({ showTitle = false }: { showTitle?: boolean }) => {
  const shared = useTranslations("marketing").shared;
  const contacts = [
    {
      image: "/marketing/contact/call-Icon.svg",
      contact: "+31(0)202612217",
      href: "tel:+31202612217",
    },
    {
      image: "/marketing/contact/sendIcon.svg",
      contact: "hello@cosmediate.nl",
      href: "mailto:hello@cosmediate.nl",
    },
  ];

  return (
    <div className={cn("w-full flex flex-col items-start justify-start gap-6")}>
      {showTitle && (
        <h1
          className={cn(
            "w-full text-start text-700 text-[42px] font-semibold leading-[50.4px]",
            "max-sm:text-2xl max-sm:leading-[28.8px] max-sm:text-center"
          )}
        >
          {shared.applyNow}
        </h1>
      )}

      <div
        className={cn(
          "w-full flex max-sm:flex-col items-start max-sm:justify-start gap-8"
        )}
      >
        {contacts.map((contact, index) => (
          <div key={index} className="flex items-center justify-start gap-2">
            <Image
              width={30}
              height={30}
              quality={100}
              src={contact.image}
              alt=""
            />
            <a
              href={contact.href}
              className={cn(
                "text-[20px] text-900 font-semibold leading-[26px] hover:underline"
              )}
            >
              {contact.contact}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactInfo;
