"use client";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

import AuthUiTemplate from "@auth/components/AuthUiTmplate";
import { SocialAccounts } from "@cosmediate/auth";
import SignupForm from "./components/SignupForm";

const SignUp = () => {
  const auth = useTranslations("auth");

  return (
    <AuthUiTemplate>
      <div
        className={cn(
          "w-full h-[70ddvh] flex flex-col items-center justify-start",
        )}
      >
        <h2
          className={cn(
            "text-xl text-900 font-medium mb-6 text-center",
            "max-sm:text-[18px]",
          )}
        >
          {auth.pages.signup.title}
        </h2>

        <div className="flex-1 flex flex-col items-center justify-start gap-6 overflow-hidden">
          <SignupForm />
          <div
            className={cn(
              "w-full flex flex-col items-center justify-center pt-2 gap-3 sticky bottom-0",
            )}
          >
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
            <SocialAccounts />
          </div>
        </div>
      </div>
    </AuthUiTemplate>
  );
};

export default SignUp;
