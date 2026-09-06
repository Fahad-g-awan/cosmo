"use client";

import React, { ReactNode, useEffect, useMemo, useRef } from "react";

import {
  FiltersLayoutLoader,
  GridItemsLoader,
  ListItemsLoader,
  MapLoader,
  NoDataFound,
  Separator,
  SiteContainer,
} from "@cosmediate/ui";
import { useScrollDirection } from "@cosmediate/ui/hooks/useScrollDirection";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  useFilters,
  usePreferences,
  usePagination,
  ViewModes,
} from "@cosmediate/browse-manager";
import { useHeader } from "@cosmediate/header/HeaderContext";
import { MobileDrawer } from "@web/components/MobileDrawer";
import { useTranslations } from "@cosmediate/i18n/client";
import { SearchHeader } from "./components/SearchHeader";
import { SideFilters } from "./components/SideFilters";
import { EntityMap } from "@web/components/EntityMap";
import { ControlBar } from "./components/ControlBar";
import { Pagination } from "./components/Pagination";
import SubHeader from "@web/layout/SubHeader";

interface BrowseLayoutContentProps<T> {
  renderItem: (item: T, viewMode: ViewModes) => ReactNode;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  noResultsComponent?: ReactNode;
  customHeader?: ReactNode;
  customControlBar?: ReactNode;
  showItemCount?: boolean;
  onNext: () => Promise<void>;
  onPrevious: () => void;
  isLoading?: boolean;
  showSearchHeader?: boolean;
  entity?: "clinics" | "specialists" | "treatments";
}

export const BrowseLayoutContent = <T,>({
  renderItem,
  loadingComponent,
  emptyComponent,
  noResultsComponent,
  customHeader,
  customControlBar,
  showItemCount = true,
  onNext,
  onPrevious,
  isLoading: isLoadingProp,
  entity,
  showSearchHeader = true,
}: BrowseLayoutContentProps<T>) => {
  const common = useTranslations("common");
  const browse = useTranslations("browse");
  const {
    config: filtersConfig,
    isSearchActive,
    isFiltersActive,
  } = useFilters();
  const { config: preferencesConfig, viewMode } = usePreferences();
  const { items, isLoading: paginationLoading } = usePagination();

  const mapLocations = useMemo(() => {
    if (!items?.length || entity === "treatments") return [];

    return (
      (items as T[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => {
          const lat = item?.location?.lat ?? item?.lat;
          const lon = item?.location?.lon ?? item?.lon;
          const parsedLat = Number(lat);
          const parsedLon = Number(lon);

          if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) {
            return null;
          }

          return {
            id: item.id,
            lat: parsedLat,
            lon: parsedLon,
          };
        })
        .filter(Boolean) as { lat: number; lon: number; id: string }[]
    );
  }, [entity, items]);

  const isLoading = isLoadingProp ?? paginationLoading;
  const hasFilters =
    (filtersConfig?.filters &&
      filtersConfig.filters.filter(
        (f) => f.type !== "location" && f.type !== "datetime",
      ).length > 0) ||
    false;
  const hasSortOptions =
    preferencesConfig?.sortOptions && preferencesConfig.sortOptions.length > 0;

  /**
   * Conditional variables for UI
   */
  const showControlBar = hasSortOptions || preferencesConfig?.viewModes;
  const showNoResultsComp =
    !isLoading && items.length < 1 && (isSearchActive || isFiltersActive);
  const showNoDataFoundComp =
    !isLoading && !isSearchActive && !isFiltersActive && items.length < 1;
  const showMap =
    viewMode === "list" &&
    preferencesConfig?.scope !== "treatments" &&
    !isLoading &&
    items.length > 0;
  const showData = !isLoading && items.length > 0;

  return (
    <BrowseLayoutShell
      hasFilters={hasFilters}
      isLoading={isLoading}
      showSearchHeader={showSearchHeader}
      customHeader={customHeader}
    >
      <div
        className={cn(
          "flex flex-col flex-1 items-center justify-start gap-7 max-sm:gap-5",
          hasFilters ? "w-[80%] max-xl:w-[70%] max-lg:w-full" : "w-full",
        )}
      >
        {showControlBar && (
          <div
            className="w-full py-2 sticky z-30 bg-white transition-[top] duration-300"
            style={{
              top: "calc(var(--search-header-top) + var(--search-header-height))",
            }}
          >
            {customControlBar || <ControlBar />}
          </div>
        )}

        {isLoading &&
          (loadingComponent ??
            (viewMode === "list" ? (
              <div className="w-full flex items-start justify-center gap-5 max-lg:flex-col max-sm:items-center max-sm:justify-start">
                <ListItemsLoader />
                <MapLoader showLoader={false} />
              </div>
            ) : (
              <GridItemsLoader />
            )))}

        {showNoResultsComp &&
          (noResultsComponent ?? (
            <NoDataFound
              message={common.dataNotFound}
              description={browse.empty.noResultsHint}
            />
          ))}

        {showNoDataFoundComp &&
          (emptyComponent ?? (
            <NoDataFound
              message={common.dataNotFound}
              description={browse.empty.refreshHint}
            />
          ))}

        <div
          className={cn("w-full flex items-start justify-start", {
            "gap-8 max-lg:gap-6 max-sm:gap-4 max-xl:flex-col":
              viewMode === "list",
          })}
        >
          {showData && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "w-full flex flex-col items-start justify-start gap-6",
              )}
            >
              {(items as T[]).map((item, index) => (
                <div key={index} className="contents">
                  {renderItem(item, viewMode)}
                  {viewMode === "list" && <Separator />}
                </div>
              ))}
            </div>
          )}

          {showMap && (
            <div
              className={cn(
                "w-full max-lg:w-full max-lg:min-h-172.25",
                "max-sm:min-h-79.75",
                "lg:sticky lg:top-[240px]",
                showSearchHeader ? "lg:top-[240px]" : "lg:top-[140px]",
              )}
            >
              <EntityMap
                locations={mapLocations}
                mapZoom={10}
                mapHeight={600}
                mapType="grey"
              />
            </div>
          )}
        </div>

        <Pagination
          showItemCount={showItemCount}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      </div>
    </BrowseLayoutShell>
  );
};

interface BrowseLayoutShellProps {
  customHeader: ReactNode;
  hasFilters: boolean;
  isLoading: boolean;
  showSearchHeader?: boolean;
  children: ReactNode;
}

const HEADER_HEIGHT = 60; // main site header height in px

export const BrowseLayoutShell = ({
  customHeader,
  isLoading,
  showSearchHeader = true,
  hasFilters,
  children,
}: BrowseLayoutShellProps) => {
  const browse = useTranslations("browse");
  const containerRef = useRef<HTMLDivElement>(null);
  const subHeaderRef = useRef<HTMLDivElement>(null);

  const {
    showMobileFilters,
    toggleMobileFilters,
    clearSidebarFilters,
    applySidebarFilters,
  } = useFilters();
  const { handleMakeHeaderSticky, handleMakeHeaderNonSticky } = useHeader();

  const isScrollingDown = useScrollDirection();

  useEffect(() => {
    handleMakeHeaderSticky();
    return () => handleMakeHeaderNonSticky();
  }, [handleMakeHeaderSticky, handleMakeHeaderNonSticky]);

  /**
   * Track SubHeader height via ResizeObserver and expose as CSS variable.
   * This lets the ControlBar and side-filters position themselves correctly
   * and auto-adapt when the SearchHeader changes height (e.g. mobile filters expand).
   */
  useEffect(() => {
    if (!subHeaderRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const subHeader = subHeaderRef.current;

    const updateHeight = () => {
      const height = subHeader.getBoundingClientRect().height;
      container.style.setProperty("--search-header-height", `${height}px`);
    };

    updateHeight();

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(subHeader);

    return () => observer.disconnect();
  }, []);

  /**
   * Update --search-header-top based on scroll direction.
   * Above lg: always visible at HEADER_HEIGHT (sticky below main header).
   * Below lg: hides on scroll down, shows on scroll up.
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const mq = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      if (mq.matches) {
        // Desktop: always visible below main header
        container.style.setProperty(
          "--search-header-top",
          `${HEADER_HEIGHT}px`,
        );
      } else if (isScrollingDown) {
        const h = subHeaderRef.current?.getBoundingClientRect().height ?? 0;
        container.style.setProperty(
          "--search-header-top",
          `${HEADER_HEIGHT - h}px`,
        );
      } else {
        container.style.setProperty(
          "--search-header-top",
          `${HEADER_HEIGHT}px`,
        );
      }
    };

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [isScrollingDown]);

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col items-center justify-start gap-6 max-sm:gap-4 mb-20"
      style={{
        ["--search-header-height" as string]: "0px",
        ["--search-header-top" as string]: `${HEADER_HEIGHT}px`,
      }}
    >
      {showSearchHeader && (
        <div
          ref={subHeaderRef}
          className={`w-full sticky z-40 bg-white transition-[top] duration-300 [overflow-anchor:none]`}
          style={{ top: "var(--search-header-top)" }}
        >
          <SubHeader>{customHeader || <SearchHeader />}</SubHeader>
        </div>
      )}

      <SiteContainer className="lg:flex-row items-start justify-center gap-7 max-sm:gap-5">
        {/* Desktop side filters */}
        <div
          className={cn("w-[20%] max-xl:w-[30%] sticky", "max-lg:hidden")}
          style={{
            top: "calc(var(--search-header-top) + var(--search-header-height) + 40px)",
          }}
        >
          <h3 className="w-full text-left pb-2 font-bold text-base leading-4 text-800">
            {browse.filters.title}
          </h3>

          <div
            className={cn(
              "w-full h-[62dvh] overflow-y-auto pl-1 pr-3 pt-3 self-start",
            )}
          >
            {isLoading ? <FiltersLayoutLoader /> : <SideFilters />}
          </div>
        </div>

        {children}
      </SiteContainer>

      {/* Mobile drawer filters */}
      {hasFilters && (
        <MobileDrawer
          open={showMobileFilters}
          onOpenChange={toggleMobileFilters}
          isLoading={isLoading}
          onConfirm={applySidebarFilters}
          onCancel={clearSidebarFilters}
          cancelText={browse.filters.clear}
          title={browse.filters.title}
        >
          {isLoading ? <FiltersLayoutLoader /> : <SideFilters />}
        </MobileDrawer>
      )}
    </div>
  );
};
