"use client";

import Link from "next/link";

import { HEADER_NAV_ITEMS, type HeaderNavKey } from "@cosmediate/i18n";
import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import AuthActions from "./AuthActions";
import Brand from "./Brand";

import { MdMenu } from "react-icons/md";

interface DesktopViewProps {
  activeLink?: HeaderNavKey | null;
  setShowMobileMenu: (show: boolean) => void;
  pathname: string;
  searchQueryString: string;
}

const DesktopView = ({
  activeLink,
  setShowMobileMenu,
  pathname,
  searchQueryString,
}: DesktopViewProps) => {
  const nav = useTranslations("nav");

  return (
    <div className="w-full h-[60px] grid grid-cols-3 items-center justify-between overflow-hidden">
      <MdMenu
        className="sm:hidden cursor-pointer size-6 text-[#374957]"
        onClick={() => setShowMobileMenu(true)}
      />

      <Brand
        className="w-full h-full flex items-center justify-start"
        logoClasses="w-[150px] max-sm:w-[100px]"
      />

      <div
        className={cn(
          "w-full h-full flex items-center justify-center gap-14 max-lg:gap-10 max-sm:hidden"
        )}
      >
        {HEADER_NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.url}
            className={cn(
              "flex inset-ring-primary-accent justify-center flex-col",
              "text-400 text-[15px] leading-[15px]",
              "hover:text-900 transition-all  duration-300",
              activeLink === item.key
                ? "text-900 font-semibold"
                : "font-semibold"
            )}
          >
            {nav[item.key]}
          </Link>
        ))}
      </div>

      <AuthActions pathname={pathname} searchQueryString={searchQueryString} />
    </div>
  );
};

export default DesktopView;
