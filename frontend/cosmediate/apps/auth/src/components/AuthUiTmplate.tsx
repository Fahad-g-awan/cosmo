"use client";

import Image from "next/image";
import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { cn } from "@cosmediate/ui/lib/utils";

interface AuthUiTemplateProps {
  children: React.ReactNode;
  className?: string;
}

const AuthUiTemplate = ({ children, className }: AuthUiTemplateProps) => {
  const auth = useTranslations("auth");

  return (
    <div
      className={cn(
        "min-h-[calc(100vh-60px)] relative overflow-x-hidden px-2",
        "flex items-center justify-center",
      )}
    >
      <div
        className={cn(
          "rounded-t-2xl relative w-full bg-gradient-lite-violet",
          "flex items-center justify-center",
        )}
      >
        <div
          className={cn(
            "fixed pointer-events-none z-0",
            "max-md:top-10 max-md:left-0 max-md:right-0 max-md:h-[40dvh] max-md:flex max-md:items-start max-md:justify-center",
            "md:inset-0 md:top-20 md:flex md:items-center md:justify-center",
          )}
        >
          <div
            className={cn(
              "relative",
              "max-md:w-[300px] max-md:h-[300px]",
              "md:w-[700px] md:h-[700px]",
              "lg:w-[700px] lg:h-[700px]",
              "xl:w-[800px] xl:h-[800px]",
            )}
          >
            <Image
              src={"/auth-bg.png"}
              alt={auth.chrome.backgroundAlt}
              fill
              priority={true}
              quality={100}
              className={cn("object-contain opacity-90")}
            />
          </div>
        </div>

        <div
          className={cn(
            "relative z-10 w-full h-[calc(100vh-60px)] flex items-center justify-center",
            // "px-4 py-8",
            // "md:px-6 md:py-12",
            // "lg:px-8"
          )}
        >
          <div
            className={cn(
              "w-full max-w-md rounded-3xl shadow-xl",
              "py-8 px-6",
              "sm:py-10 sm:px-8",
              "md:py-12 md:px-10",
              "backdrop-blur-sm bg-white/85",
              "mx-auto",
              "max-sm:absolute max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:rounded-b-none",
              className,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthUiTemplate;
