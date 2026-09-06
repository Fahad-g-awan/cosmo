"use client";

import Link from "next/link";
import React, { useLayoutEffect, useState } from "react";

import { useLocale, useTranslations } from "@cosmediate/i18n/client";
import { ButtonLoader } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import ProfileCard from "./ProfileCard";
import { useAuth } from "@cosmediate/auth";

import {
  buildSignInHref,
  resolveSignInPath,
  resolveSignupHref,
} from "../lib/build-signin-href";

const AuthActions = ({
  pathname,
  searchQueryString,
}: {
  pathname: string;
  searchQueryString: string;
}) => {
  const header = useTranslations("header");
  const locale = useLocale();
  const { isAuthenticated, isSessionLoading, sessionUser } = useAuth();
  const urlPath = pathname;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const signinPath = resolveSignInPath(baseUrl);
  const signInHref = buildSignInHref(
    signinPath,
    pathname,
    searchQueryString,
    locale,
  );

  /** IdP signup is off-origin for web/blog/app — useLayoutEffect applies real origin before paint */
  const [signupHref, setSignupHref] = useState(() =>
    resolveSignupHref(baseUrl, locale),
  );
  useLayoutEffect(() => {
    setSignupHref(resolveSignupHref(window.location.origin, locale));
  }, [locale]);

  const isProfileHydrating =
    isSessionLoading || (isAuthenticated && !sessionUser);

  if (isProfileHydrating) {
    return (
      <div className={cn("flex flex-row items-center justify-end")}>
        <ButtonLoader variant="light" />
      </div>
    );
  }

  if (isAuthenticated && sessionUser) {
    return (
      <div className={cn("flex flex-row items-center justify-end")}>
        <ProfileCard />
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-end">
      {!isAuthenticated && urlPath.includes("/signin") && (
        <div className="w-full flex items-center justify-end gap-3">
          <span
            className={cn(
              "text-sm pointer-events-none text-900 font-normal",
              "max-lg:hidden",
            )}
          >
            {header.dontHaveAccount}
          </span>
          <Link
            href={signupHref}
            className={cn(
              "text-primary-accent font-semibold leading-[15px] text-[15px]",
              "hover:text-primary-accent/80  transition-all duration-300",
            )}
          >
            {header.signUp}
          </Link>
        </div>
      )}

      {!isAuthenticated && (
        <React.Fragment>
          {urlPath.includes("/signup") && (
            <span
              className={cn(
                "text-sm text-900 pointer-events-none font-normal mr-2",
                "max-lg:hidden",
              )}
            >
              {header.alreadyHaveAccount}
            </span>
          )}

          {!urlPath.includes("/signin") && (
            <Link
              href={signInHref}
              className={cn(
                "text-primary-accent/85 font-semibold leading-[15px] text-[15px]",
                "hover:text-primary-accent transition-all duration-300",
              )}
            >
              {header.signIn}
            </Link>
          )}
        </React.Fragment>
      )}
    </div>
  );
};

export default AuthActions;
