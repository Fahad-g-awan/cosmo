"use client";

import React, { Suspense, useEffect, useRef } from "react";

import {
  FiltersProvider,
  PreferencesProvider,
  PaginationProvider,
  useFilters,
  usePreferences,
  usePagination,
  useDataFetch,
} from "@cosmediate/browse-manager";
import { useTranslations } from "@cosmediate/i18n/client";

import type { BrowseLayoutProps, BrowseLayoutConfig } from "./types";
import { BrowseLayoutContent } from "./Content";

export type { BrowseLayoutProps, BrowseLayoutConfig } from "./types";

const BrowseLayoutSuspenseFallback = () => {
  const common = useTranslations("common");
  return <div>{common.loading}</div>;
};

// Component to initialize configs and update when filter options change
const ConfigSetter = ({ config }: { config: BrowseLayoutConfig }) => {
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

const BrowseLayoutInner = <T,>({
  config,
  fetchData,
  renderItem,
  loadingComponent,
  emptyComponent,
  noResultsComponent,
  entity,
  publicBrowse = true,
}: BrowseLayoutProps<T>) => {
  const { isReady, isLoading, runNext, goPrevious } = useDataFetch({
    fetchData,
    autoFetch: true,
    requireAuth: !publicBrowse,
  });

  return (
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
    />
  );
};

const BrowseLayoutWithProviders = <T,>(props: BrowseLayoutProps<T>) => {
  return (
    <FiltersProvider>
      <PreferencesProvider>
        <PaginationProvider>
          <ConfigSetter config={props.config} />
          <BrowseLayoutInner {...props} />
        </PaginationProvider>
      </PreferencesProvider>
    </FiltersProvider>
  );
};

export const BrowseLayout = <T,>(props: BrowseLayoutProps<T>) => {
  return (
    <Suspense
      fallback={props.loadingComponent || <BrowseLayoutSuspenseFallback />}
    >
      <BrowseLayoutWithProviders {...props} />
    </Suspense>
  );
};

export default BrowseLayout;
