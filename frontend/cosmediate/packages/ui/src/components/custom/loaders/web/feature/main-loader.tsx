"use client";

import { Suspense } from "react";
import { SiteContainer } from "../../../site-container";
import { Skeleton } from "../../../../skeleton";
import { ControlbarLoader } from "./controlbar-loader";
import { GridItemsLoader } from "./grid-items-loader";
import { ListItemsLoader } from "./list-items-loader";
import { MainHeaderLoader } from "./main-header-loader";
import { FiltersLayoutLoader } from "./filters-loader";
import { MapLoader } from "../map-loader";
import { useSearchParams } from "next/navigation";

const MainFeaturesLoaderInner = () => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <SiteContainer className="w-full items-center justify-start gap-10 mb-10">
        <MainHeaderLoader />

        <div className="w-full flex items-start justify-center gap-5">
          <div className="w-[20%] max-lg:hidden flex items-start justify-center gap-5">
            <FiltersLayoutLoader />
          </div>

          <div className="w-[80%] max-lg:w-full flex flex-col items-center justify-start gap-10">
            <ControlbarLoader />
            {view === "list" ? (
              <div className="w-full flex items-start justify-center gap-5 max-lg:flex-col max-sm:items-center max-sm:justify-start">
                <ListItemsLoader />
                <MapLoader showLoader={false} />
              </div>
            ) : (
              <GridItemsLoader />
            )}

            <div className="w-full flex items-center justify-end gap-4">
              <Skeleton className="w-20 h-10" />
              <Skeleton className="w-20 h-10" />
            </div>
          </div>
        </div>
      </SiteContainer>
    </div>
  );
};

const MainFeaturesLoaderFallback = () => (
  <div className="w-full flex flex-col items-center justify-start">
    <SiteContainer className="w-full items-center justify-start gap-10 mb-10">
      <MainHeaderLoader />
      <div className="w-full flex items-start justify-center gap-5">
        <div className="w-[20%] max-lg:hidden flex items-start justify-center gap-5">
          <FiltersLayoutLoader />
        </div>
        <div className="w-[80%] max-lg:w-full flex flex-col items-center justify-start gap-10">
          <ControlbarLoader />
          <GridItemsLoader />
          <div className="w-full flex items-center justify-end gap-4">
            <Skeleton className="w-20 h-10" />
            <Skeleton className="w-20 h-10" />
          </div>
        </div>
      </div>
    </SiteContainer>
  </div>
);

export const MainFeaturesLoader = () => (
  <Suspense fallback={<MainFeaturesLoaderFallback />}>
    <MainFeaturesLoaderInner />
  </Suspense>
);
