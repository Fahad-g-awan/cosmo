import React from "react";

import {
  NoDataFound,
  ScrollArea,
  SecondaryTabs,
  SecondaryTabsList,
  SecondaryTabsTrigger,
  TreatmentSelectionLoader,
} from "@cosmediate/ui";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { cn } from "@cosmediate/ui/lib/utils";

import type { TreatmentCategoryTab } from "../../types/treatment.types";

import { TabHeader } from "../TabHeader";
import { LuBriefcaseMedical } from "react-icons/lu";

const TreatmentsManagementLayout = ({
  children,
  setActiveCategory,
  activeCategory,
  categories,
  sectionTitle,
  sectionDecription,
  isLoading,
  showNoDataFound,
}: {
  children: React.ReactNode;
  activeCategory: TreatmentCategoryTab | undefined;
  setActiveCategory: (value: TreatmentCategoryTab) => void;
  categories: TreatmentCategoryTab[];
  sectionTitle?: string;
  sectionDecription?: string;
  isLoading?: boolean;
  showNoDataFound?: boolean;
}) => {
  const { windowWidth } = useWindowWidth();

  return (
    <div
      className={cn("w-full flex flex-col items-center justify-start gap-6")}
    >
      <TabHeader
        title={sectionTitle || "Manage Treatments"}
        description={
          sectionDecription ||
          "Manage and organize your clinic’s treatments and related details."
        }
      />

      {isLoading && <TreatmentSelectionLoader />}

      {showNoDataFound && (
        <NoDataFound
          message={"Treatments Data Not Found"}
          description={
            "If you think this is a mistake, please try again or contact support"
          }
          icon={<LuBriefcaseMedical className="size-6 text-500" />}
        />
      )}

      {!isLoading && (
        <div
          className={cn(
            "w-full flex items-start justify-center gap-4",
            "max-xl:flex-col max-xl:justify-center max-xl:items-center"
          )}
        >
          <div className="w-[30%] z-40 max-xl:w-full xl:sticky xl:top-20 flex flex-col items-start justify-end max-xl:justify-start gap-5">
            <SecondaryTabs
              value={activeCategory?.id}
              orientation={windowWidth <= 1280 ? "horizontal" : "vertical"}
            >
              <ScrollArea
                orientation="horizontal"
                className="w-full max-[1280px]:w-[calc(100dvw-30rem)] max-[1024px]:w-[calc(100dvw-10rem)] max-[800px]:w-[calc(100dvw-4rem)] max-[624px]:w-[calc(100dvw-3rem)] rounded-xl"
              >
                <SecondaryTabsList>
                  {categories.map((category) => (
                    <SecondaryTabsTrigger
                      key={category.id}
                      value={category.id}
                      onClick={() => setActiveCategory(category)}
                      className="capitalize text-[13px]"
                    >
                      {category?.name}
                    </SecondaryTabsTrigger>
                  ))}
                </SecondaryTabsList>
              </ScrollArea>
            </SecondaryTabs>
          </div>

          <div className="w-[70%] max-xl:w-full">{children}</div>
        </div>
      )}
    </div>
  );
};

export default TreatmentsManagementLayout;
