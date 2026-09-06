"use client";

import Link from "next/link";
import React, { useMemo } from "react";

import { Drawer, DrawerContent, DrawerTrigger } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import { shouldShowClinicSwitcher } from "@app/lib/clinic-scope";
import { useWorkspace } from "@app/context/WorkspaceContext";

import { ClinicScopeSwitcherMobile } from "../components/ClinicScopeSwitcherMobile";
import { ProfileMenuHeader } from "../components/ProfileMenuHeader";
import { getProfileMenuItems } from "../lib/getProfileMenuItems";

export interface MobileProfileDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const ProfileDrawer: React.FC<MobileProfileDrawerProps> = ({
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
        iconClassName: "text-800 size-4",
      }),
    [userRole, handleLogout],
  );

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <div>{children}</div>
      </DrawerTrigger>
      <DrawerContent className="w-full">
        <div className="p-4 bg-ghost-blue-2 rounded-2xl w-full flex flex-col items-start justify-start gap-2">
          <ProfileMenuHeader className="mb-1 bg-white/80" />

          {showClinicSwitcher ? (
            <ClinicScopeSwitcherMobile
              onClinicSelected={() => onOpenChange(false)}
            />
          ) : null}

          {menuItems.map((item) =>
            item.danger ? (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="cursor-pointer py-2 hover:bg-cloud w-full flex items-center justify-start gap-4"
              >
                <div className="mt-0.5">{item.icon}</div>
                <span className="text-sm font-semibold text-danger">
                  {item.label}
                </span>
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="cursor-pointer py-2 hover:bg-cloud w-full flex items-center justify-start gap-4"
              >
                <div className="mt-0.5">{item.icon}</div>
                <span className={cn("text-sm text-800 font-semibold")}>
                  {item.label}
                </span>
              </Link>
            ),
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProfileDrawer;
