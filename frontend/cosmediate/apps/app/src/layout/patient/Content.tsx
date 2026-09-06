import React, { Suspense, useMemo } from "react";
import Link from "next/link";

import {
  PrimaryTabs,
  PrimaryTabsList,
  PrimaryTabsTrigger,
  SiteContainer,
  ScrollArea,
  PrimaryTabsContent,
} from "@cosmediate/ui";
import {
  AppointmentTabLoader,
  SettingsTabLoader,
  InboxTabLoader,
  SmallLoader,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import type { RouteConfig } from "@app/types/shared";

const Content = ({
  children,
  activePath,
  tabs,
}: {
  children: React.ReactNode;
  activePath: string;
  tabs: RouteConfig[];
}) => {
  const FallbackLoader = useMemo(() => {
    if (activePath.toLowerCase().includes("settings")) {
      return <SettingsTabLoader />;
    } else if (activePath.toLowerCase().includes("appointments")) {
      return <AppointmentTabLoader />;
    } else if (activePath.toLowerCase().includes("inbox")) {
      return <InboxTabLoader />;
    } else {
      return <SmallLoader />;
    }
  }, [activePath]);

  const showTabs = tabs.length > 1;

  return (
    <PrimaryTabs
      defaultValue={tabs[0]?.label || "Appointments"}
      value={activePath}
      className="w-full h-full flex items-center justify-center"
    >
      {showTabs && (
        <PrimaryTabsList className="w-full max-sm:w-max mb-6 bg-linear-to-r from-[#f6f8ff] to-ghost-blue">
          <ScrollArea
            className="w-full flex items-center justify-center"
            orientation="horizontal"
          >
            <div className="w-full flex items-center justify-center">
              <SiteContainer className="flex flex-row items-center justify-start">
                {tabs.map((tab) => (
                  <PrimaryTabsTrigger
                    key={tab.label}
                    value={tab.label}
                    className={cn(
                      tab.label === "Appointments" ? "w-[130px]" : "w-[100px]",
                    )}
                  >
                    <Link href={tab.path} className="p-0 w-full">
                      {tab.label}
                    </Link>
                  </PrimaryTabsTrigger>
                ))}
              </SiteContainer>
            </div>
          </ScrollArea>
        </PrimaryTabsList>
      )}

      <PrimaryTabsContent
        value={activePath}
        className="w-full h-full flex flex-col items-center justify-center mb-10"
      >
        <Suspense fallback={FallbackLoader}>
          <SiteContainer>{children}</SiteContainer>
        </Suspense>
      </PrimaryTabsContent>
    </PrimaryTabs>
  );
};

export default Content;
