"use client";

import React, { Suspense, useEffect, useRef } from "react";

import {
  useDataFetch,
  useFilters,
  usePagination,
  usePreferences,
  type FetchParams,
  type FetchResponse,
  type ViewModes,
} from "@cosmediate/browse-manager";
import { SmallLoader } from "@cosmediate/ui";

import type { BrowseLayoutConfig } from "@web/layout/BrowseLayout";
import { BrowseLayoutContent } from "@web/layout/BrowseLayout/Content";

export interface ProfileBrowseTabProps<T> {
  config: BrowseLayoutConfig;
  fetchData: (params: FetchParams) => Promise<FetchResponse<T>>;
  renderItem: (item: T, viewMode: ViewModes) => React.ReactNode;
  entity: "clinics" | "specialists" | "treatments";
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  noResultsComponent?: React.ReactNode;
}

export const ProfileBrowseConfigSetter = ({
  config,
}: {
  config: BrowseLayoutConfig;
}) => {
  const { setConfig: setPrefsConfig } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope } = usePagination();

  const lastConfigKey = useRef<string | null>(null);

  useEffect(() => {
    const key = JSON.stringify({
      filters: config.filters,
      prefs: config.preferences,
    });

    if (lastConfigKey.current === key) return;
    lastConfigKey.current = key;

    setFiltersConfig(config.filters);
    setPrefsConfig(config.preferences);
    setScope(config.filters.scope);
  }, [config, setFiltersConfig, setPrefsConfig, setScope]);

  return null;
};

export const ProfileBrowseTab = <T,>({
  config,
  fetchData,
  renderItem,
  entity,
  loadingComponent,
  emptyComponent,
  noResultsComponent,
}: ProfileBrowseTabProps<T>) => {
  const { isReady, isLoading, runNext, goPrevious } = useDataFetch({
    fetchData,
    autoFetch: true,
    requireAuth: false,
  });

  return (
    <Suspense fallback={loadingComponent || <SmallLoader showText={false} />}>
      <div className="mt-8" />
      <ProfileBrowseConfigSetter config={config} />
      <BrowseLayoutContent
        renderItem={renderItem}
        loadingComponent={loadingComponent}
        emptyComponent={emptyComponent}
        noResultsComponent={noResultsComponent}
        customHeader={config.customHeader}
        customControlBar={config.customControlBar}
        showItemCount={config.showItemCount}
        onNext={runNext}
        onPrevious={goPrevious}
        isLoading={!isReady || isLoading}
        entity={entity}
        showSearchHeader={false}
      />
    </Suspense>
  );
};
