"use client";

import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { useNavigation } from "./context";
import { Navigation } from "./Navigation";
import { Header } from "./Header";

import { PermissionRouteGuard } from "@app/components/guards/PermissionRouteGuard";

export const ManagementLayoutContent = ({
  children,
  tenant,
}: {
  children: React.ReactNode;
  tenant: "admin" | "clinic" | "specialist";
}) => {
  const { isStyleRounded } = useNavigation();

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-ghost-white">
      <Header />

      <div
        className={cn(
          "flex-1 w-full flex overflow-hidden",
          "pr-3 max-lg:pl-2 max-lg:pr-2",
          "max-lg:flex-col-reverse"
        )}
      >
        <Navigation />

        <div
          className={cn(
            "rounded-2xl bg-white flex flex-col items-center justify-start",
            "max-lg:rounded-b-none",
            "w-full overflow-hidden",
            "px-6 py-4 max-xl:px-4 max-sm:px-2",
            isStyleRounded ? "lg:rounded-tl-2xl" : "lg:rounded-tl-none"
          )}
        >
          <div className={cn("flex-1 container overflow-hidden")}>
            <PermissionRouteGuard tenant={tenant}>
              {children}
            </PermissionRouteGuard>
          </div>
        </div>
      </div>
    </div>
  );
};
