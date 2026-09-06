"use client";

import React from "react";
import { cn } from "@cosmediate/ui/lib/utils";
import { Search } from "lucide-react";
import { ProfileCard } from "@app/modules/ProfileCard";

export const HeaderActions = ({
  setShowMobileSearchMenu,
}: {
  setShowMobileSearchMenu: (show: boolean) => void;
}) => {
  return (
    <div className="w-fit justify-self-end flex items-center gap-3 max-sm:gap-1">
      <button
        onClick={() => setShowMobileSearchMenu(true)}
        className={cn("hidden max-sm:block w-5 h-5 mr-2")}
      >
        <Search className="size-5" />
      </button>
      {/* <div className="rounded-full p-2 bg-gray-200">N</div> */}
      <ProfileCard />
    </div>
  );
};
