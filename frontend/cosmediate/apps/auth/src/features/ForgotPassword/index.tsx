"use client";

import { cn } from "@cosmediate/ui/lib/utils";
import { useTranslations } from "@cosmediate/i18n/client";

import ForgotPasswordForm from "./components/ForgotPasswordForm";
import AuthUiTemplate from "@auth/components/AuthUiTmplate";

const ForgotPassword = () => {
  const auth = useTranslations("auth");

  return (
    <AuthUiTemplate>
      <div className={cn(" flex flex-col items-center justify-center")}>
        <h2
          className={cn(
            "text-xl text-900 font-medium mb-2 text-center",
            "max-sm:text-[18px]"
          )}
        >
          {auth.pages.forgotPassword.title}
        </h2>
        <p
          className={cn(
            "text-center w-[315px] text-sm text-400 font-medium mb-6",
            " max-sm:w-auto"
          )}
        >
          {auth.pages.forgotPassword.subtitle}
        </p>
      </div>

      <ForgotPasswordForm />
    </AuthUiTemplate>
  );
};

export default ForgotPassword;
