"use client";

import React from "react";

import { NavigationProvider, PanelHeaderProvider } from "./context";
import { ManagementLayoutContent } from "./Content";

interface ManagementLayoutProps {
  tenant: "clinic" | "specialist" | "admin";
  children: React.ReactNode;
}

export const ManagementLayout = ({
  tenant,
  children,
}: ManagementLayoutProps) => {
  return (
    <NavigationProvider tenant={tenant}>
      <PanelHeaderProvider>
        <ManagementLayoutContent tenant={tenant}>
          {children}
        </ManagementLayoutContent>
      </PanelHeaderProvider>
    </NavigationProvider>
  );
};
