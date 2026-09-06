"use client";

import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { FiLogOut } from "react-icons/fi";

export const LogoutButton: React.FC<{
  onClick: () => void;
  className?: string;
}> = React.memo(({ onClick, className }) => (
  <button
    type="button"
    className={cn(
      "mt-auto flex flex-col gap-2.5 justify-center cursor-pointer items-center pb-1 w-full px-2 pt-2 text-400 hover:text-error",
      className
    )}
    onClick={onClick}
  >
    <FiLogOut size={20} />
    <span className="text-[8px] uppercase font-medium leading-[12px] tracking-[2%] text-center">
      Logout
    </span>
  </button>
));

LogoutButton.displayName = "LogoutButton";
