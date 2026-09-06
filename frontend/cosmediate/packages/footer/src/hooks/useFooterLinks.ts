"use client";

import { useTranslations } from "@cosmediate/i18n/client";
import { buildFooterLinks } from "@cosmediate/i18n";

const useFooterLinks = () => {
  const nav = useTranslations("nav");
  const footer = useTranslations("footer");

  return buildFooterLinks(nav, footer);
};

export default useFooterLinks;
