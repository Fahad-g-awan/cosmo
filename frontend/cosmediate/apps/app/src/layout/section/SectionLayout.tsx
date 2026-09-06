"use client";

import {
  FiltersProvider,
  PreferencesProvider,
  PaginationProvider,
} from "@cosmediate/browse-manager";

import { Suspense, useState } from "react";
import { usePanelHeader } from "@app/layout/management/context";
import { PanelHeader } from "@app/layout/management/PanelHeader";
import { ListExportProvider } from "@app/modules/export";
import SectionNavigation from "@app/layout/section/sectionNavigation";
import { SectionLayoutLoader } from "@cosmediate/ui/index";

const SectionLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<SectionLayoutLoader />}>
      <SectionLayoutInner>{children}</SectionLayoutInner>
    </Suspense>
  );
};

const SectionLayoutInner = ({ children }: { children: React.ReactNode }) => {
  const [showMobileSectionNav, setShowMobileSectionNav] = useState(false);
  const [showMobileMenuBtn, setShowMobileMenuBtn] = useState(true);

  const { panelHeaderConfig } = usePanelHeader();

  return (
    <FiltersProvider>
      <PreferencesProvider>
        <PaginationProvider>
          <ListExportProvider>
            <div className="w-full h-full flex flex-col items-center justify-start gap-3 overflow-hidden">
              {panelHeaderConfig && (
                <PanelHeader
                  pageTitle={panelHeaderConfig.pageTitle}
                  buttonLabel={panelHeaderConfig?.actionPath?.label || ""}
                  buttonLink={panelHeaderConfig?.actionPath?.link || ""}
                  showActions={panelHeaderConfig?.showActions}
                  showSearch={panelHeaderConfig?.showSearch}
                  showExportBtn={panelHeaderConfig?.showExportBtn}
                  showAddBtn={panelHeaderConfig?.showAddBtn}
                  setShowMobileSectionNav={setShowMobileSectionNav}
                  showMobileSectionNav={showMobileSectionNav}
                  showMobileMenuBtn={showMobileMenuBtn}
                />
              )}

            {/* <div className="w-full h-[82dvh] overflow-y-auto overflow-lite"> */}
            <SectionNavigation
              showMobileSectionNav={showMobileSectionNav}
              setShowMobileSectionNav={setShowMobileSectionNav}
              setShowMobileMenuBtn={setShowMobileMenuBtn}
            >
              {children}
            </SectionNavigation>
            {/* </div> */}
            </div>
          </ListExportProvider>
        </PaginationProvider>
      </PreferencesProvider>
    </FiltersProvider>
  );
};

export default SectionLayout;
