"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

import { SmallLoader, InfoMessage } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { Toaster } from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";

import AuthUiTemplate from "@auth/components/AuthUiTmplate";
import { SocialAccounts } from "@cosmediate/auth";
import SignInForm from "./components/SigninForm";

const SignInContent = () => {
  const auth = useTranslations("auth");
  const searchParams = useSearchParams();
  const successKey = searchParams.get("success");
  const successBanner =
    successKey === "password_set"
      ? auth.banners.passwordSet
      : successKey === "password_updated"
        ? auth.banners.passwordUpdated
        : null;

  useEffect(() => {
    const errorDescription = searchParams.get("error_description");
    if (!errorDescription) return;

    const lower = errorDescription.toLowerCase();
    if (lower.includes("blocked")) {
      Toaster(
        auth.errors.accountBlockedTitle,
        "error",
        auth.errors.accountBlockedDescription,
      );
      return;
    }
    if (lower.includes("unavailable")) {
      Toaster(
        auth.errors.accountUnavailableTitle,
        "error",
        auth.errors.accountUnavailableDescription,
      );
      return;
    }
    if (lower.includes("email mismatch") || lower.includes("mismatch")) {
      Toaster(auth.processing.failedTitle, "error", auth.errors.emailMismatch);
      return;
    }

    Toaster(errorDescription, "error");
  }, [searchParams, auth]);

  return (
    <AuthUiTemplate>
      <div className={cn("w-full h-full")}>
        {successBanner && (
          <div className="mb-4">
            <InfoMessage
              variant="success"
              size="sm"
              title={successBanner.title}
              message={successBanner.message}
            />
          </div>
        )}
        <h2
          className={cn(
            "text-xl text-900 font-medium mb-6 text-center",
            "max-sm:text-[18px] ",
          )}
        >
          {auth.pages.signin.title}
        </h2>

        <SignInForm />

        <div
          className={cn(
            "flex flex-col items-center justify-center gap-5",
            "max-sm:gap-3",
          )}
        >
          <div className="w-full flex flex-col justify-center items-start text-sm gap-3">
            <div className="w-full flex justify-between items-center">
              <span className={cn("h-px w-full bg-200")}></span>
              <span
                className={cn(
                  "w-[150px] px-5 text-600 leading-[16px] text-xs",
                  "max-sm:w-[200px]",
                )}
              >
                {auth.dividers.orUse}
              </span>
              <span className={cn("h-px w-full bg-200")}></span>
            </div>
          </div>
          <SocialAccounts />
        </div>
      </div>
    </AuthUiTemplate>
  );
};

const SignIn = () => {
  return (
    <Suspense fallback={<SmallLoader />}>
      <SignInContent />
    </Suspense>
  );
};

export default SignIn;
