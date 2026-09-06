"use client";

import React from "react";

import { Drawer, DrawerContent, DrawerHeader } from "@cosmediate/ui";

export interface MobileMobileSectionNavProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
}

const MobileSectionNav: React.FC<MobileMobileSectionNavProps> = ({
  isOpen,
  title,
  children,
  onOpenChange,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="">
        <DrawerHeader className="w-fit capitalize flex items-center justify-start text-700 font-semibold">
          {title}
        </DrawerHeader>
        <div className="w-full mb-3">{children}</div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileSectionNav;
