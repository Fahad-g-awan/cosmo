"use client";

import { Suspense } from "react";
import { SiteContainer } from "../../site-container";
import { Skeleton } from "../../../skeleton";
import { ControlbarLoader } from "../web/feature/controlbar-loader";
import { GridItemsLoader } from "../web/feature/grid-items-loader";
import { ListItemsLoader } from "../web/feature/list-items-loader";
import { MainHeaderLoader } from "../web/feature/main-header-loader";
import { BlogFiltersLoader } from "./BlogFiltersLoader";
import { useSearchParams } from "next/navigation";

const BlogsMainPageLoaderInner = () => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  return (
    <div className="w-full flex flex-col items-center justify-start">
      <SiteContainer className="w-full items-center justify-start gap-10 mb-10">
        <MainHeaderLoader />

        <div className="w-full flex items-start justify-center gap-5">
          <div className="w-[80%] max-lg:w-full flex flex-col items-center justify-start gap-10">
            <ControlbarLoader />
            {view === "list" ? (
              <div className="w-full flex items-start justify-center gap-5 max-lg:flex-col max-sm:items-center max-sm:justify-start">
                <ListItemsLoader />
              </div>
            ) : (
              <GridItemsLoader />
            )}

            <div className="w-full flex items-center justify-end gap-4">
              <Skeleton className="w-20 h-10" />
              <Skeleton className="w-20 h-10" />
            </div>
          </div>

          <div className="w-[20%] max-lg:hidden flex items-start justify-center gap-5">
            <BlogFiltersLoader />
          </div>
        </div>
      </SiteContainer>
    </div>
  );
};

const BlogsMainPageLoaderFallback = () => (
  <div className="w-full flex flex-col items-center justify-start">
    <SiteContainer className="w-full items-center justify-start gap-10 mb-10">
      <MainHeaderLoader />
      <div className="w-full flex items-start justify-center gap-5">
        <div className="w-[80%] max-lg:w-full flex flex-col items-center justify-start gap-10">
          <ControlbarLoader />
          <GridItemsLoader />
          <div className="w-full flex items-center justify-end gap-4">
            <Skeleton className="w-20 h-10" />
            <Skeleton className="w-20 h-10" />
          </div>
        </div>
        <div className="w-[20%] max-lg:hidden flex items-start justify-center gap-5">
          <BlogFiltersLoader />
        </div>
      </div>
    </SiteContainer>
  </div>
);

export const BlogsMainPageLoader = () => (
  <Suspense fallback={<BlogsMainPageLoaderFallback />}>
    <BlogsMainPageLoaderInner />
  </Suspense>
);
