"use client";

import React, { Suspense } from "react";
import {
  PrimaryTabs,
  PrimaryTabsContent,
  PrimaryTabsList,
  PrimaryTabsTrigger,
} from "@cosmediate/ui";
import { ProfilePageLoader, NoDataFound, TabsLoader } from "@cosmediate/ui";
import { Breadcrumbs, SiteContainer } from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";

import {
  resolveBreadcrumbs,
  resolveHeaderConfig,
  getDefaultTab,
  resolveTabLabel,
} from "./utils";
import { DetailsPageHeader } from "./components/DetailsPageHeader";
import type { DetailLayoutProps } from "./types";
import SubHeader from "@web/layout/SubHeader";

// Re-export types
export type {
  DetailLayoutConfig,
  DetailLayoutProps,
  TabConfig,
  TabComponentProps,
  HeaderConfig,
  EntityHeaderConfig,
  TitleHeaderConfig,
  CustomHeaderConfig,
  EntityType,
  ApiSource,
  EntityHeaderData,
} from "./types";

// Re-export utils
export {
  resolveBreadcrumbs,
  resolveHeaderConfig,
  getDefaultTab,
  resolveTabLabel,
  capitalizeFirst,
  createDetailBreadcrumbs,
  resolveProfileTabLabel,
} from "./utils";

// Re-export hooks
export { useDetailData } from "./hooks";
export type { UseDetailDataOptions, UseDetailDataReturn } from "./hooks";

const DetailLayoutContent = <T,>({
  entity,
  isLoading,
  config,
  activeTab,
  onTabChange,
  loadingComponent,
  emptyComponent,
  SearchHeader,
}: DetailLayoutProps<T>) => {
  const common = useTranslations("common");
  const breadcrumbs = resolveBreadcrumbs(config, activeTab, entity);
  const headerConfig = resolveHeaderConfig(config, entity);

  const showLoading = isLoading && !entity;
  const showEmpty = !isLoading && !entity;

  if (showLoading) {
    return <>{loadingComponent || <ProfilePageLoader />}</>;
  }

  if (showEmpty) {
    return (
      <div className="w-full h-[50dvh] flex items-center justify-center mt-5">
        {emptyComponent || (
          <NoDataFound
            message={common.dataNotFound}
            description={common.pleaseTryAgain}
            className="my-10"
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <SubHeader>
        <Breadcrumbs items={breadcrumbs} />
        {SearchHeader && SearchHeader}
        <DetailsPageHeader header={headerConfig} />
      </SubHeader>

      <PrimaryTabs
        value={activeTab}
        defaultValue={getDefaultTab(config)}
        onValueChange={onTabChange}
        className="w-full flex flex-col items-center justify-start"
      >
        <PrimaryTabsList className="w-full flex flex-row items-start justify-center bg-linear-to-r from-[#f6f8ff] to-ghost-blue">
          <SiteContainer className="w-full flex-row items-start justify-start">
            <div className="w-[65%] max-xl:w-[60%] max-lg:w-screen px-2 overflow-x-auto overflow-transparent flex items-start justify-start">
              {config.tabs.map((tab) => (
                <PrimaryTabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="w-25"
                >
                  {resolveTabLabel(tab.label, entity as T)}
                </PrimaryTabsTrigger>
              ))}
            </div>
          </SiteContainer>
        </PrimaryTabsList>

        {config.tabs.map((tab) => {
          const Component = tab.component;
          return (
            <PrimaryTabsContent
              key={tab.id}
              value={tab.id}
              className="w-full flex flex-col items-center justify-center"
            >
              <Suspense fallback={<TabsLoader />}>
                <Component
                  entity={entity as T}
                  setActiveTab={onTabChange}
                  activeTab={activeTab}
                  {...tab.props}
                />
              </Suspense>
            </PrimaryTabsContent>
          );
        })}
      </PrimaryTabs>
    </div>
  );
};

// Exported component with Suspense wrapper
export const DetailLayout = <T,>(props: DetailLayoutProps<T>) => {
  return (
    <Suspense fallback={props.loadingComponent || <ProfilePageLoader />}>
      <DetailLayoutContent {...props} />
    </Suspense>
  );
};

export default DetailLayout;
