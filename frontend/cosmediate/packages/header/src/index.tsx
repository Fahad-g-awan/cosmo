"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import type { HeaderNavKey } from "@cosmediate/i18n";
import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import MobileSideNavbar from "./components/MobileSideNavbar";
import { useHeader } from "./context/HeaderContext";
import DesktopView from "./components/DesktopView";

function HeaderSuspenseFallback() {
  return (
    <div
      className={cn(
        "w-full min-h-[60px] flex items-center justify-center bg-white border-b border-transparent",
      )}
      aria-hidden
    />
  );
}

function HeaderInner() {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<HeaderNavKey | null>(null);
  const { isTopSticky, isScrollSticky } = useHeader();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQueryString = searchParams.toString();

  const getActiveLink = (path: string): HeaderNavKey | null => {
    if (
      path.startsWith("/specialists") ||
      path.startsWith("/home/specialists")
    ) {
      return "specialists";
    }
    if (path.startsWith("/treatments") || path.startsWith("/home/treatments")) {
      return "treatments";
    }
    if (path.startsWith("/clinics") || path.startsWith("/home/clinics")) {
      return "clinics";
    }

    return null;
  };

  useEffect(() => {
    const activeLinkCurrent = getActiveLink(pathname);

    if (activeLinkCurrent == null) {
      setActiveLink(null);
    } else {
      setActiveLink(activeLinkCurrent);
    }
  }, [pathname]);

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center",
        isTopSticky && "sticky top-0 z-50 bg-white",
        isScrollSticky &&
          "sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-md transition-all duration-700",
      )}
    >
      <SiteContainer className="flex items-center justify-center">
        <DesktopView
          activeLink={activeLink}
          setShowMobileMenu={setShowMobileMenu}
          pathname={pathname}
          searchQueryString={searchQueryString}
        />
        <MobileSideNavbar
          setShowMobileMenu={setShowMobileMenu}
          showMobileMenu={showMobileMenu}
          activeLink={activeLink}
          pathname={pathname}
          searchQueryString={searchQueryString}
        />
      </SiteContainer>
    </div>
  );
}

export const Header = () => (
  <Suspense fallback={<HeaderSuspenseFallback />}>
    <HeaderInner />
  </Suspense>
);
