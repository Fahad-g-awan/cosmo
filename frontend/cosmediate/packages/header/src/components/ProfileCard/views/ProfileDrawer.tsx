"use client";

import Link from "next/link";
import React from "react";

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  Separator,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import { getMenuItems } from "../../../lib/config";
import { ProfileMenuHeader } from "../components/ProfileMenuHeader";

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
  const { handleLogout } = useAuth();
  const menuItems = getMenuItems();
  const navItems = menuItems.filter((item) => item.label !== "Logout");
  const logoutItems = menuItems.filter((item) => item.label === "Logout");

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <div>{children}</div>
      </DrawerTrigger>
      <DrawerContent className="w-full">
        <div className="p-4 bg-200/50 rounded-2xl w-full flex flex-col items-start justify-start gap-2">
          <ProfileMenuHeader className="mb-1 bg-white/80" />

          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="w-full flex items-center justify-start gap-3 py-2 hover:bg-ghost-blue-2"
            >
              {<item.icon className={cn(item.iconClasses)} />}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}

          <Separator className="my-2" />

          {logoutItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={handleLogout}
              className="cursor-pointer py-2 hover:bg-danger/30 w-full flex items-center justify-start gap-3"
            >
              <span className="mt-0.5">
                {<item.icon className={cn(item.iconClasses)} />}
              </span>
              <span className={cn("text-xs text-danger")}>{item.label}</span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProfileDrawer;
