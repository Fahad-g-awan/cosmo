"use client";

import React from "react";
import Link from "next/link";

import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

import SearchAndFilter from "@app/modules/SearchAndFilter";
import { ExportMenuButton } from "@app/modules/export";

import { TbPlus } from "react-icons/tb";
import { FiMenu } from "react-icons/fi";

interface PanelHeaderProps {
  pageTitle: string;
  buttonLabel: string;
  buttonLink: string;
  showActions: boolean;
  showSearch?: boolean;
  showExportBtn?: boolean;
  showAddBtn?: boolean;
  showMobileSectionNav: boolean;
  setShowMobileSectionNav: React.Dispatch<React.SetStateAction<boolean>>;
  showMobileMenuBtn: boolean;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  pageTitle,
  buttonLabel,
  buttonLink,
  showActions,
  showSearch,
  showExportBtn,
  showAddBtn,
  showMobileSectionNav,
  setShowMobileSectionNav,
  showMobileMenuBtn,
}) => {
  const { isMobileView, isTabletView } = useWindowWidth();

  const showSearchBar = Boolean(showSearch);
  const showActionButtons = Boolean(showActions);

  if (!pageTitle && !showActionButtons && !showSearchBar) return null;

  return (
    <div
      className={cn(
        "w-full flex justify-between items-center gap-3 max-sm:gap-2",
        { "max-sm:flex-col": isMobileView && (showActionButtons || showSearchBar) }
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          showActionButtons || showSearchBar
            ? "w-[40%] max-sm:w-full"
            : "w-full"
        )}
      >
        <h1
          className={cn(
            "w-full",
            "text-xl max-lg:text-lg max-sm:text-base font-bold text-800 capitalize",
            "max-sm:w-full max-sm:text-start"
          )}
        >
          {pageTitle}
        </h1>

        {isMobileView && showAddBtn && (
          <Link
            href={buttonLink}
            className={cn(
              "flex items-center justify-center gap-2",
              "p-0! h-8 w-9 rounded-lg",
              "bg-primary-accent hover:bg-primary-accent/90 text-white",
              "transition-all duration-300 ease-in-out"
            )}
          >
            <TbPlus className="size-4" />
          </Link>
        )}
      </div>

      <div
        className={cn(
          "flex items-center justify-end gap-2",
          showActionButtons || showSearchBar
            ? "w-[60%] max-sm:w-full"
            : "max-lg:w-[50px]"
        )}
      >
        {(showSearchBar || showActionButtons) && (
          <div className={cn("w-full", "flex items-center justify-end gap-2")}>
            {showSearchBar && <SearchAndFilter />}

            {showActionButtons && (
              <div className={cn("w-fit flex items-center justify-end gap-2")}>
                {(showExportBtn === undefined || showExportBtn) && (
                  <ExportMenuButton />
                )}

                {!isMobileView && showAddBtn && (
                  <Link
                    href={buttonLink}
                    className={cn(
                      "lg:min-w-[150px] flex items-center justify-center gap-2 py-2.5",
                      "max-sm:p-0! max-sm:h-8 max-sm:w-8 max-sm:rounded-lg",
                      "bg-primary-accent hover:bg-primary-accent/90 text-white rounded-lg px-3 py-2.5",
                      "transition-all duration-300 ease-in-out"
                    )}
                  >
                    <TbPlus className="size-4" />
                    <span
                      className={cn(
                        "font-bold text-xs leading-[17px] capitalize max-lg:hidden"
                      )}
                    >
                      {buttonLabel}
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {(isMobileView || isTabletView) && showMobileMenuBtn && (
          <Button
            variant="outline"
            className={cn(
              "lg:min-w-[80px] flex items-center justify-center gap-2 py-2.5",
              "max-sm:p-0! max-sm:h-8 max-sm:w-8 max-sm:rounded-lg"
            )}
            onClick={() => setShowMobileSectionNav(!showMobileSectionNav)}
          >
            <FiMenu className="size-4 text-600" />
          </Button>
        )}
      </div>
    </div>
  );
};
