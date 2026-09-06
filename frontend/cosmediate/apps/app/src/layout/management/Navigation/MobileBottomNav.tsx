"use client";

import React from "react";
import ReactDOM from "react-dom";

import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { SidebarLoader } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { usePlatformNavigation } from "@app/context/PlatformNavigationContext";

import { LogoutButton } from "./components/LogoutButton";
import { SidebarItem } from "./components/SidebarItem";
import {
  MobileOverflowMenu,
  MobileOverflowMenuButton,
} from "./components/MobileOverflowMenu";
import { useNavigation } from "../context";

export const MobileBottomNav = () => {
  const {
    mobileNavVisibleLinks,
    mobileOverflowMenuLinks,
    showMobileOverflowMenu,
    toggleOverflowMenu,
    handleLogout,
  } = useNavigation();

  const { isLoading: isNavigationLoading, hasNavError } =
    usePlatformNavigation();
  const { isMobileView } = useWindowWidth();

  if (hasNavError) {
    return null;
  }

  if (
    isNavigationLoading ||
    mobileOverflowMenuLinks.length === 0 ||
    mobileNavVisibleLinks.length === 0
  ) {
    return (
      <div className="w-full flex lg:hidden">
        <SidebarLoader />
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "w-full bg-ghost-white flex flex-col justify-between items-center z-50 lg:hidden"
      )}
      aria-label="Sidebar Navigation"
    >
      <nav className="w-full lg:h-[80dvh] lg:pb-4 overflow-x-hidden overflow-y-scroll nav">
        <ul
          className={cn(
            "lg:space-y-[8px] lg:ml-2 max-sm:h-[58px]",
            "max-lg:-mx-2 max-sm:mx-2 max-lg:flex max-lg:justify-evenly max-lg:pb-[6px] max-lg:bg-ghost-white max-sm:justify-between"
          )}
        >
          {mobileNavVisibleLinks.map((route, index) => (
            <SidebarItem key={index} route={route} index={index} />
          ))}

          <li className="lg:hidden max-sm:hidden flex items-center justify-center">
            <LogoutButton onClick={handleLogout} className="mt-0 mb-2.5" />
          </li>

          {isMobileView && (
            <MobileOverflowMenuButton toggleOverflowMenu={toggleOverflowMenu} />
          )}

          {typeof window !== "undefined" &&
            ReactDOM.createPortal(
              <MobileOverflowMenu
                mobileOverflowMenuLinks={mobileOverflowMenuLinks}
                showMobileOverflowMenu={showMobileOverflowMenu}
                handleLogout={handleLogout}
              />,
              document.body
            )}
        </ul>
      </nav>
    </aside>
  );
};
