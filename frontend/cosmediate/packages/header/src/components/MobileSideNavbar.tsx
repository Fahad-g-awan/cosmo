"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";

import { Sheet, SheetClose, SheetContent, SheetHeader } from "@cosmediate/ui";
import { HEADER_NAV_ITEMS, type HeaderNavKey } from "@cosmediate/i18n";
import { useLocale, useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  buildSignInHref,
  resolveSignInPath,
  resolveSignupHref,
} from "../lib/build-signin-href";

import { X } from "lucide-react";
import { useAuth } from "@cosmediate/auth";

const MobileSideNavbar = ({
  setShowMobileMenu,
  showMobileMenu,
  activeLink,
  pathname,
  searchQueryString,
}: {
  setShowMobileMenu: (show: boolean) => void;
  showMobileMenu: boolean;
  activeLink?: HeaderNavKey | null;
  pathname: string;
  searchQueryString: string;
}) => {
  return (
    <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
      <SheetContent side="left" className="w-screen">
        <SheetHeader>
          <SheetClose onClick={() => setShowMobileMenu(false)} />
          <NavBarContent
            setShowMobileMenu={setShowMobileMenu}
            activeLink={activeLink}
            pathname={pathname}
            searchQueryString={searchQueryString}
          />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

const NavBarContent = ({
  setShowMobileMenu,
  activeLink,
  pathname,
  searchQueryString,
}: {
  setShowMobileMenu: (show: boolean) => void;
  activeLink?: HeaderNavKey | null;
  pathname: string;
  searchQueryString: string;
}) => {
  const nav = useTranslations("nav");
  const header = useTranslations("header");
  const locale = useLocale();
  const { isAuthenticated, handleLogout } = useAuth();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const signInHref = buildSignInHref(
    resolveSignInPath(origin),
    pathname,
    searchQueryString,
    locale,
  );

  const [signupHref, setSignupHref] = useState(() =>
    resolveSignupHref(origin, locale),
  );
  useLayoutEffect(() => {
    setSignupHref(resolveSignupHref(window.location.origin, locale));
  }, [locale]);

  return (
    <div
      className={cn(
        "w-full absolute inset-0 flex flex-col items-center justify-start p-6 gap-35",
        "bg-white text-center overflow-hidden z-20000",
      )}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div
          onClick={() => {
            setShowMobileMenu(false);
          }}
          className=""
        >
          {isAuthenticated && (
            <button
              onClick={() => handleLogout()}
              className={cn(
                "text-danger font-semibold leading-[15px] text-[15px]",
              )}
            >
              {header.signOut}
            </button>
          )}

          {!isAuthenticated && pathname.includes("/signin") && (
            <Link
              href={signupHref}
              className={cn(
                "text-primary-accent/90 font-semibold leading-[15px] text-[15px]",
                "hover:text-accent transition-all duration-300",
              )}
            >
              {header.signUp}
            </Link>
          )}

          {!isAuthenticated && (
            <Link
              href={signInHref}
              className={cn(
                "text-primary-accent/90 font-semibold leading-[15px] text-[15px]",
                "hover:text-primary-accent transition-all duration-300",
              )}
            >
              {header.signIn}
            </Link>
          )}
        </div>

        <X
          strokeWidth={1.5}
          className="size-5"
          onClick={() => setShowMobileMenu(false)}
        />
      </div>

      {/* Menu items content */}
      <div className="w-full flex flex-col items-center justify-center gap-14">
        {HEADER_NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.url}
            onClick={() => {
              setShowMobileMenu(false);
            }}
            className={cn(
              "text-400 text-[15px] leading-[15px]",
              "hover:text-900 transition-all duration-300",
              activeLink === item.key
                ? "text-900 font-semibold"
                : "font-semibold",
            )}
          >
            {nav[item.key]}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileSideNavbar;
