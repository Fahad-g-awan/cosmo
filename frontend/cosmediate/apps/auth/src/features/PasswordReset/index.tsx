"use client";

import { useState } from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import ResetPasswordForm from "./components/ResetPasswordForm";
import AuthUiTemplate from "@auth/components/AuthUiTmplate";
import SuccessStatus from "./components/SuccessStatus";
import RejectStatus from "./components/RejectStatus";

const ResetPassword = () => {
  const auth = useTranslations("auth");
  const [status, setStatus] = useState<boolean | undefined>(undefined);
  console.log("status", status);
  return (
    <AuthUiTemplate>
      {status === true ? (
        <SuccessStatus />
      ) : status === false ? (
        <RejectStatus setStatus={setStatus} />
      ) : (
        <div className={cn("w-full h-full")}>
          <div>
            <h2
              className={cn(
                "text-xl text-900 font-medium mb-2 text-center",
                "max-sm:text-[18px]",
              )}
            >
              {auth.pages.resetPassword.title}
            </h2>
            <div className={cn(" flex justify-center")}>
              <p
                className={cn(
                  "text-center w-[305px] text-sm text-400 font-medium mb-6",
                )}
              >
                {auth.pages.resetPassword.subtitle}
              </p>
            </div>
          </div>

          <div>
            <ResetPasswordForm setStatus={setStatus} />
          </div>
        </div>
      )}
    </AuthUiTemplate>
  );
};

export default ResetPassword;
