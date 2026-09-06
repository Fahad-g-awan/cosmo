"use client";

import Image from "next/image";
import React from "react";
import { CheckCircle2, LinkIcon, Shield } from "lucide-react";

import { Button, ButtonLoader, Toaster } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useTranslations } from "@cosmediate/i18n/client";

import { useSocialAccountLink } from "../hooks/useSocialAccountLink";
import { useSocialAccountsSignin } from "../hooks/useSocialAccountsSignin";

export interface SocialAccountsProps {
  linkedProviders?: string[];
  /** `signin` = Hosted UI login; `settings` = link Google to existing account */
  context?: "signin" | "settings";
  returnTo?: string;
}

const DEFAULT_SETTINGS_RETURN_TO = "/settings/account/security/manage-password";

export default function SocialAccounts({
  linkedProviders = [],
  context = "signin",
  returnTo = DEFAULT_SETTINGS_RETURN_TO,
}: SocialAccountsProps) {
  const auth = useTranslations("auth");
  const { handleSocialAuth } = useSocialAccountsSignin();
  const { handleLinkGoogle, isLinking } = useSocialAccountLink();

  const isProviderLinked = (provider: string) =>
    linkedProviders.some((p) => p.toLowerCase() === provider.toLowerCase());

  const handleLogin = async (provider: "google" | "facebook" | "apple") => {
    if (isProviderLinked(provider)) return;

    try {
      if (provider === "google" && context === "settings") {
        await handleLinkGoogle(returnTo);
        return;
      }

      await handleSocialAuth(
        provider,
        context === "settings" ? "manual" : "auto",
      );
    } catch (error) {
      console.log("[SocialAccounts] Error in handleLogin:", error);
      Toaster(auth.social.genericError, "error");
    }
  };

  const renderButton = (
    provider: "google" | "facebook" | "apple",
    iconSrc: string,
    label: string,
    disabled?: boolean,
  ) => {
    const isLinked = isProviderLinked(provider);
    const isGoogleLinking = provider === "google" && isLinking;

    return (
      <div className={cn(context === "settings" ? "w-full max-w-xs" : "w-1/3")}>
        <Button
          variant="outline"
          onClick={() => handleLogin(provider)}
          disabled={disabled || isGoogleLinking}
          className={cn(
            "w-full relative border-2 py-2",
            context === "settings" && "h-12",
            isLinked && "cursor-default pointer-events-none",
          )}
        >
          <div className={cn("flex items-center justify-center gap-2")}>
            <Image
              height={100}
              width={100}
              src={iconSrc}
              alt={label}
              className={context === "settings" ? "size-6" : "size-4"}
            />
            <span className="max-sm:hidden font-semibold text-primary-accent">
              {label}
            </span>

            {isGoogleLinking && (
              <div className="">
                <ButtonLoader variant="light" />
              </div>
            )}
          </div>

          {isLinked && (
            <div className="absolute z-20 opacity-80 inset-0 bg-green-200 border-green-200 w-full flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="max-sm:hidden font-semibold text-green-600">
                {auth.social.connected}
              </span>
            </div>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div
      className={cn("w-full flex flex-col items-start justify-center gap-3")}
    >
      {context === "settings" && (
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="w-5 h-5 text-600" />
          <h2 className="text-lg font-semibold text-900">
            {auth.social.settingsHeading}
          </h2>
        </div>
      )}

      <div
        className={cn(
          "w-full flex items-center justify-center gap-4",
          "max-sm:mb-3",
        )}
      >
        {renderButton("google", "/auth/google-icon.svg", "Google")}
        {/* {context === "signin" && ( */}
        <>
          {renderButton(
            "facebook",
            "/auth/facebook-icon.svg",
            "Facebook",
            true,
          )}
          {renderButton("apple", "/auth/apple-icon.svg", "Apple", true)}
        </>
        {/* )} */}
      </div>
    </div>
  );
}
