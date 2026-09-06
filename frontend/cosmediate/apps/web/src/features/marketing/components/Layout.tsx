"use client";

import React, { ReactNode } from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import type { Item as BreadcrumbItemType } from "@cosmediate/ui";
import { Breadcrumbs } from "@cosmediate/ui";
import { SiteContainer } from "@cosmediate/ui";
import { Separator, MissionSection } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import SubHeader from "@web/layout/SubHeader";

interface LayoutProps {
  children: ReactNode;
  title: string;
  path?: string;
}

const Layout = ({ children, title, path }: LayoutProps) => {
  const nav = useTranslations("nav");
  const breadcrumbData: BreadcrumbItemType[] = [
    { label: nav.home, path: "/home" },
    { label: title, path },
  ];

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-start gap-14 max-lg:gap-10"
      )}
    >
      <SubHeader>
        <Breadcrumbs items={breadcrumbData} />
        <SubHeader.Title>{title}</SubHeader.Title>
      </SubHeader>

      <div
        className={cn(
          "w-full flex flex-col items-center justify-start gap-14 max-lg:gap-10"
        )}
      >
        <SiteContainer className="gap-14 max-lg:gap-10">
          {children}
          <Separator />
        </SiteContainer>

        <MissionSection />
      </div>
    </div>
  );
};

export default Layout;
