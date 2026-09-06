"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { resolveFooterShortcutHref } from "../lib/resolve-footer-href";

const FooterLinkItem = ({ url, label }: { url: string; label: string }) => {
  const [href, setHref] = useState(url);

  useEffect(() => {
    setHref(resolveFooterShortcutHref(url));
  }, [url]);

  return (
    <div className="text-300 text-[12px] leading-[16.8px] hover:text-400 transition-all duration-300">
      <Link href={href}>{label}</Link>
    </div>
  );
};

export default FooterLinkItem;
