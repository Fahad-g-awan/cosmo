"use client";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import useFooterLinks from "../hooks/useFooterLinks";

import FooterLinkItemComp from "./FooterLinkItem";

const KnowledgeLinks = () => {
  const footer = useTranslations("footer");
  const footerLinks = useFooterLinks();

  return (
    <div className={cn("w-full flex flex-col items-start justify-start gap-4")}>
      <div className="text-sm font-bold leading-[17px] text-100">
        {footer.knowledge}
      </div>
      <div className="w-full grid grid-cols-1 gap-3">
        {footerLinks.knowledge.map((item, index) => (
          <FooterLinkItemComp key={index} url={item.url} label={item.label} />
        ))}
      </div>
    </div>
  );
};

export default KnowledgeLinks;
