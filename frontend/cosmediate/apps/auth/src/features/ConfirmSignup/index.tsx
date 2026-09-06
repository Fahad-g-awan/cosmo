"use client";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import AuthUiTemplate from "@auth/components/AuthUiTmplate";
import ConfirmSignup from "./components/ConfirmSignupForm";

const VerifyEmail = () => {
  const auth = useTranslations("auth");

  return (
    <AuthUiTemplate>
      <div
        className={cn("w-full flex flex-col items-center justify-center gap-4")}
      >
        <div className={cn("flex flex-col items-center justify-center gap-3")}>
          <h2
            className={cn(
              "text-xl text-900 font-medium text-center",
              "max-sm:text-[18px]",
            )}
          >
            {auth.pages.confirmSignup.title}
          </h2>
          <p className="text-gray-600 text-center">
            {auth.pages.confirmSignup.subtitle}
          </p>
        </div>

        <ConfirmSignup />
      </div>
    </AuthUiTemplate>
  );
};

export default VerifyEmail;
