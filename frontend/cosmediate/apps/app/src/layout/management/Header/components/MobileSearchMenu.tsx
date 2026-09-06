"use client";

import { MainSearch } from "@app/modules/MainSearch";
import React from "react";
import { IoMdArrowBack } from "react-icons/io";

export const MobileSearchMenu = ({
  setShowMobileSearchMenu,
}: {
  setShowMobileSearchMenu: (show: boolean) => void;
}) => {
  return (
    <div className="hidden max-sm:flex fixed z-50 inset-0 w-full h-screen bg-gray-50 flex-col items-center justify-start">
      <div className="w-full px-2 py-3 bg-ghost-white flex items-center justify-between gap-2">
        <IoMdArrowBack
          onClick={() => setShowMobileSearchMenu(false)}
          className="size-5 cursor-pointer"
        />
        <MainSearch />
      </div>

      <div className="w-full flex flex-col items-center justify-start p-3">
        <h3 className="w-full text-left text-800 font-medium text-sm">
          Search results
        </h3>
      </div>
    </div>
  );
};
