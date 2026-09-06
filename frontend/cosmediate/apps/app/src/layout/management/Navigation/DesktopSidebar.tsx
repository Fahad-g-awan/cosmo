"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { SidebarLoader } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { usePlatformNavigation } from "@app/context/PlatformNavigationContext";

import { SidebarItem } from "./components/SidebarItem";
import { LogoutButton } from "./components/LogoutButton";
import { useNavigation } from "../context";

export const DesktopSidebar = () => {
  const { handleLogout, sidebarLinks } = useNavigation();
  const { isLoading: isNavigationLoading, hasNavError } =
    usePlatformNavigation();
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!navRef.current) return;

      const activeElement = navRef.current.querySelector(
        'li[data-active="true"]',
      );

      activeElement?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "auto",
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (hasNavError) {
    return null;
  }

  if (isNavigationLoading || !sidebarLinks || sidebarLinks.length === 0) {
    return (
      <div className="max-w-[80px] max-lg:hidden">
        <SidebarLoader />
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "h-[84vh] min-w-[80px] bg-ghost-white flex flex-col justify-between items-center z-50 max-lg:hidden",
      )}
      aria-label="Sidebar Navigation"
    >
      <nav
        ref={navRef}
        className="w-full lg:h-[80dvh] lg:pb-4 overflow-x-hidden overflow-y-scroll nav"
      >
        <ul
          className={cn(
            "lg:space-y-[8px] lg:ml-2 max-sm:h-[58px]",
            "max-lg:-mx-2 max-sm:mx-2 max-lg:flex max-lg:justify-evenly max-lg:pb-[6px] max-lg:bg-ghost-white max-sm:justify-between",
          )}
        >
          {sidebarLinks.map((route, index) => (
            <SidebarItem key={index} route={route} index={index} />
          ))}

          <li className="lg:hidden max-sm:hidden flex items-center justify-center">
            <LogoutButton onClick={handleLogout} className="mt-0 mb-2.5" />
          </li>
        </ul>
      </nav>

      <div className="my-2 h-px w-[80%] bg-stroke max-lg:hidden" />
      <LogoutButton onClick={handleLogout} className="max-lg:hidden" />
    </aside>
  );
};
