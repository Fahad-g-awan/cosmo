"use client";

import React from "react";
import { FiLogOut } from "react-icons/fi";

import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Button } from "@cosmediate/ui";

import { RouteConfig } from "@app/types/shared";
import { SidebarItem } from "./SidebarItem";

import { BsThreeDots } from "react-icons/bs";

export const MobileOverflowMenu = ({
  mobileOverflowMenuLinks,
  showMobileOverflowMenu,
  handleLogout,
}: {
  mobileOverflowMenuLinks: RouteConfig[];
  showMobileOverflowMenu: boolean;
  handleLogout: () => void;
}) => {
  const { isMobileView } = useWindowWidth();

  if (!isMobileView || !showMobileOverflowMenu) return null;

  return (
    <ul className="fixed bottom-[65px] right-1 bg-ghost-white p-[10px] rounded-lg max-w-[8rem] z-10 shadow-lg">
      {mobileOverflowMenuLinks.map((route, index) => (
        <div key={index}>
          <SidebarItem route={route} index={index + 4} />
          <p className="py-2"></p>
        </div>
      ))}

      <li
        className="flex items-center justify-center py-[20px] px-[20px] text-900 flex-col"
        onClick={handleLogout}
      >
        <button className="hover:bg-gray-300" aria-label="Logout">
          <FiLogOut className="text-400" size={20} />
        </button>
      </li>
    </ul>
  );
};

export const MobileOverflowMenuButton = ({
  toggleOverflowMenu,
}: {
  toggleOverflowMenu: () => void;
}) => (
  <li
    key="toggle"
    className="relative flex items-center justify-center py-[16px] pr-4 w-1/6 text-900 flex-col"
  >
    <Button
      variant="ghost"
      onClick={toggleOverflowMenu}
      aria-label="More links"
      className="hover:bg-[#F3F6FF]"
    >
      <BsThreeDots className="text-400" size={24} />
    </Button>
  </li>
);
