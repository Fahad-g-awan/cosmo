"use client";

import React, { useState } from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import {
  Separator,
  ButtonLoader,
  SiteContainer,
  Input,
  Button,
  Toaster,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { createLeadApi } from "@cosmediate/api";

export const MissionSection = () => {
  const newsletter = useTranslations("marketing").shared.missionNewsletter;
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      setIsLoading(true);

      if (!validateEmail(email)) {
        Toaster(newsletter.toastInvalidEmail, "error");
        setIsLoading(false);
        return;
      }

      const response = await createLeadApi({
        email,
        type: "SUBSCRIPTION",
        source: "NEWSLETTER_CAMPAIGN",
      });

      if (response?.success) {
        Toaster(newsletter.toastSuccess, "success");
        setEmail("");
      } else {
        console.log("[MissionSection] Leads API failed", response);
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      console.error("[MissionSection] Error submitting form:", error);
      Toaster(newsletter.toastError, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteContainer>
      <div
        className={cn(
          "w-full relative flex items-center justify-between gap-10 mb-14 max-lg:mb-10",
          "max-lg:flex-col max-lg:justify-center"
        )}
      >
        <div
          className={cn(
            "w-[500px] flex flex-col items-start justify-start gap-5",
            "max-lg:w-full max-lg:text-center max-lg:justify-center max-lg:items-center max-lg:gap-8"
          )}
        >
          <h2
            className={cn(
              "w-full font-bold text-[60px] leading-[72px] text-700 ",
              "max-lg:text-[50px] max-lg:leading-[60px] max-lg:text-center",
              "max-sm:text-[40px] max-sm:leading-[48px]"
            )}
          >
            {newsletter.heading}
          </h2>
          <p
            className={cn(
              "w-full max-lg:w-[400px] max-sm:w-full font-semibold text-[30px] leading-10 text-700 lg:ml-16",
              "max-lg:text-[26px] max-lg:leading-8 max-lg:text-center",
              "max-sm:text-[20px] max-sm:leading-6"
            )}
          >
            {newsletter.statementLead}{" "}
            <span className="text-primary-accent">{newsletter.safe}</span>,{" "}
            <span className="text-primary-accent">{newsletter.honest}</span> &{" "}
            <span className="text-primary-accent">{newsletter.transparent}</span>{" "}
            {newsletter.statementTail}
          </p>
        </div>

        <Separator
          orientation="vertical"
          className={cn("h-40 hidden lg:block bg-200/80 absolute right-[40%]")}
        />
        <Separator
          orientation="horizontal"
          className={cn("hidden max-lg:block bg-200/80", "w-34")}
        />

        <div
          className={cn(
            "w-[35%] flex flex-col items-start justify-center gap-6",
            "max-lg:w-full max-lg:items-center"
          )}
        >
          <div
            className={cn(
              "w-full flex flex-col items-start justify-start max-lg:items-center max-lg:justify-center max-lg:gap-2"
            )}
          >
            <h3
              className={cn(
                "w-full text-700 font-bold text-[30px] pb-1 leading-9",
                "max-lg:text-center"
              )}
            >
              {newsletter.stayInTouch}
            </h3>
            <p
              className={cn(
                "w-full text-500 text-[12px] leading-[16.8px]",
                "max-lg:text-center"
              )}
            >
              {newsletter.newsletterSubtitle}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-lg:w-[50%] max-sm:w-full"
          >
            <div className={cn("w-full flex gap-2 max-sm:flex-col")}>
              <Input
                type="email"
                placeholder={newsletter.emailPlaceholder}
                className={cn("w-full h-10")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="max-sm:w-full h-10 px-8 max-xl:px-4"
              >
                {isLoading && <ButtonLoader />}
                {!isLoading && newsletter.send}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SiteContainer>
  );
};
