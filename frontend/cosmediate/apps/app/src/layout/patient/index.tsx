"use client";

import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

import type { Item as BreadcrumbItemType } from "@cosmediate/ui";
import { Header as AppHeader } from "@cosmediate/header";
import { ProfileHeaderLoader } from "@cosmediate/ui";
import { Breadcrumbs } from "@cosmediate/ui";
import { useAuth } from "@cosmediate/auth";

import {
  getSurfaceNavItems,
  matchesNavRootPath,
  toSidebarRoutes,
} from "@app/lib/platformNavigation";
import { PermissionRouteGuard } from "@app/components/guards/PermissionRouteGuard";
import { usePlatformNavigation } from "@app/context/PlatformNavigationContext";
import { usePermissions } from "@app/hooks/usePermissions";

import DashboardContent from "./Content";
import Header from "./Header";

const PatientLayout = ({ children }: { children: React.ReactNode }) => {
  const { sessionUser } = useAuth();
  const { perms } = usePermissions();
  const { navigation, isLoading: isNavigationLoading } =
    usePlatformNavigation();
  const pathname = usePathname();

  const patientNavRoutes = useMemo(() => {
    if (isNavigationLoading) return [];

    const platformItems = getSurfaceNavItems(
      navigation,
      "patient",
      perms,
      "PATIENT",
    );

    if (platformItems.length) {
      return toSidebarRoutes(platformItems);
    }

    return [];
  }, [isNavigationLoading, navigation, perms]);

  const activePath = useMemo(() => {
    const activeRoute = patientNavRoutes.find((route) =>
      matchesNavRootPath(pathname, route.path),
    );
    return activeRoute?.label || patientNavRoutes[0]?.label || "Appointments";
  }, [pathname, patientNavRoutes]);

  const patientBreadcrumbs: BreadcrumbItemType[] = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: patientNavRoutes[0]?.path || "/appointments" },
    { label: activePath, path: pathname },
  ];

  const isLoading = !sessionUser;

  return (
    <div className="w-full h-screen flex flex-col justify-start items-center overflow-y-auto overflow-x-hidden">
      <div className="w-full">
        <AppHeader />

        <Header>
          <Breadcrumbs items={patientBreadcrumbs} />
          {!isLoading && sessionUser && (
            <Header.HeaderContent sessionUser={sessionUser} />
          )}
          {isLoading && <ProfileHeaderLoader />}
        </Header>
      </div>

      <DashboardContent activePath={activePath} tabs={patientNavRoutes}>
        <PermissionRouteGuard>{children}</PermissionRouteGuard>
      </DashboardContent>
    </div>
  );
};

export default PatientLayout;
