"use client";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import useFooterLinks from "../hooks/useFooterLinks";

import FooterLinkItemComp from "./FooterLinkItem";

const TreatmentsLinks = ({ className }: { className?: string }) => {
  const nav = useTranslations("nav");
  const footerLinks = useFooterLinks();

  const buildQueryUrl = (baseUrl: string, params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return `${baseUrl}?${query}`;
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-4",
        className
      )}
    >
      <div className="text-sm font-bold leading-[17px] text-100">
        {nav.treatments}
      </div>
      <div className="w-full grid grid-cols-2 gap-3">
        {footerLinks.treatments.map((item, index) => (
          <FooterLinkItemComp
            key={index}
            url={buildQueryUrl(item.url, { query: item.label })}
            label={item.label}
          />
        ))}
      </div>
    </div>
  );
};

export default TreatmentsLinks;
