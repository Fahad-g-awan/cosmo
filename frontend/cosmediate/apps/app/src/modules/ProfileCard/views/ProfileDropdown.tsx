"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import React, { useMemo } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import { shouldShowClinicSwitcher } from "@app/lib/clinic-scope";
import { useWorkspace } from "@app/context/WorkspaceContext";

import { ClinicScopeSwitcherDesktop } from "../components/ClinicScopeSwitcherDesktop";
import { ProfileMenuHeader } from "../components/ProfileMenuHeader";
import { getProfileMenuItems } from "../lib/getProfileMenuItems";

interface ProfileDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onOpenChange,
  children,
}) => {
  const { handleLogout, userRole, sessionUser } = useAuth();
  const { kind } = useWorkspace();

  const showClinicSwitcher = shouldShowClinicSwitcher(
    userRole,
    kind,
    sessionUser?.scope?.workingType,
  );

  const menuItems = useMemo(
    () =>
      getProfileMenuItems({
        userRole,
        onLogout: () => handleLogout(),
      }),
    [userRole, handleLogout],
  );

  const navItems = menuItems.filter((item) => !item.danger);
  const logoutItems = menuItems.filter((item) => item.danger);

  return (
    <>
      {isOpen &&
        createPortal(
          <div className={cn("fixed inset-0 bg-black/20 z-50")} />,
          document.body,
        )}

      <DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
        <DropdownMenuTrigger asChild>
          <div>{children}</div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[300px] rounded-xl border-none p-3 pt-0 mt-2 relative overflow-visible shadow-none outline-none"
          avoidCollisions={false}
        >
          <div className="size-5 bg-white rotate-45 -translate-y-[9px] translate-x-56 max-[400px]:translate-x-48" />

          <div className="mb-2">
            <ProfileMenuHeader />
          </div>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuGroup>
            {showClinicSwitcher ? (
              <ClinicScopeSwitcherDesktop
                onClinicSelected={() => onOpenChange(false)}
              />
            ) : null}

            {navItems.map((item) => (
              <DropdownMenuItem
                className="p-0 hover:bg-ghost-blue-2"
                key={item.label}
                onClick={() => onOpenChange(false)}
              >
                <Link
                  href={item.href}
                  className="w-full flex items-center justify-start gap-3 py-3 px-2"
                >
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuGroup>
            {logoutItems.map((item) => (
              <DropdownMenuItem
                key={item.label}
                className="w-full flex items-center gap-3 cursor-pointer py-3 hover:bg-danger/30"
                onClick={item.onClick}
              >
                {item.icon}
                <span className="text-xs text-danger">{item.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProfileDropdown;
