"use client";

import React, { useState } from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { HeaderActions } from "./components/HeaderActions";
import { MobileSearchMenu } from "./components/MobileSearchMenu";
import { MainSearch } from "@app/modules/MainSearch";
import { Logo } from "./components/Logo";

export const Header: React.FC = () => {
  const [showMobileSearchMenu, setShowMobileSearchMenu] = useState(false);

  return (
    <header
      className={cn(
        "w-full h-[50px] bg-ghost-white text-900 flex items-center",
        "px-8 max-lg:px-4 max-sm:px-2"
      )}
    >
      <div className="w-full grid grid-cols-3 max-sm:grid-cols-2 justify-between items-center">
        <Logo />
        <MainSearch className="max-sm:hidden" />
        <HeaderActions setShowMobileSearchMenu={setShowMobileSearchMenu} />
      </div>

      {showMobileSearchMenu && (
        <MobileSearchMenu setShowMobileSearchMenu={setShowMobileSearchMenu} />
      )}
    </header>
  );
};
