"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";

import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { useAuth } from "@cosmediate/auth";

import {
  getSurfaceNavItems,
  roleForTenant,
  surfaceForTenant,
  toSidebarRoutes,
} from "@app/lib/platformNavigation";
import { usePlatformNavigation } from "@app/context/PlatformNavigationContext";
import { usePermissions } from "@app/hooks/usePermissions";
import type { RouteConfig } from "@app/types/shared";

import { VISIBLE_NAVBAR_ITEMS } from "../Navigation/config";

interface NavigationContextType {
  sidebarLinks: RouteConfig[];
  isStyleRounded: boolean;
  showMobileOverflowMenu: boolean;
  toggleOverflowMenu: () => void;
  handleLogout: () => void;
  mobileNavVisibleLinks: RouteConfig[];
  mobileOverflowMenuLinks: RouteConfig[];
  getSidebarLinks: (tenant: "admin" | "clinic" | "specialist") => RouteConfig[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

interface NavigationProviderProps {
  tenant: "admin" | "clinic" | "specialist";
  children: ReactNode;
}

export const NavigationProvider = ({
  tenant,
  children,
}: NavigationProviderProps) => {
  const [showMobileOverflowMenu, setShowMobileOverflowMenu] = useState(false);
  const [sidebarLinks, setSidebarLinks] = useState<RouteConfig[]>([]);
  const [isStyleRounded, setIsStyleRounded] = useState(false);

  const { navigation, isLoading: isNavigationLoading } =
    usePlatformNavigation();
  const { handleLogout } = useAuth();
  const { perms } = usePermissions();
  const { isMobileView } = useWindowWidth();
  const pathname = usePathname();

  const getSidebarLinks = useCallback(
    (tenantKey: "admin" | "clinic" | "specialist"): RouteConfig[] => {
      if (isNavigationLoading) return [];

      const surface = surfaceForTenant(tenantKey);
      const platformItems = getSurfaceNavItems(
        navigation,
        surface,
        perms,
        roleForTenant(tenantKey),
      );

      if (platformItems.length) {
        return toSidebarRoutes(platformItems);
      }

      return [];
    },
    [navigation, perms, isNavigationLoading],
  );

  const toggleOverflowMenu = useCallback(() => {
    setShowMobileOverflowMenu((prev) => !prev);
  }, []);

  useEffect(() => {
    setSidebarLinks(getSidebarLinks(tenant));
  }, [tenant, getSidebarLinks]);

  useEffect(() => {
    if (sidebarLinks.length > 0) {
      const firstLink = sidebarLinks[0];

      if (firstLink && "path" in firstLink) {
        const path = firstLink.path as string;
        const isUnderFirstLink =
          pathname.startsWith(path) || pathname.startsWith(`${path}/`);
        const isExactWithTrailingSlash = pathname === `${path}/`;

        setIsStyleRounded(!(isUnderFirstLink || isExactWithTrailingSlash));
      }
    }
  }, [pathname, sidebarLinks]);

  const mobileNavVisibleLinks = useMemo(() => {
    return sidebarLinks.slice(
      0,
      isMobileView ? VISIBLE_NAVBAR_ITEMS : sidebarLinks.length,
    );
  }, [isMobileView, sidebarLinks]);

  const mobileOverflowMenuLinks = useMemo(() => {
    return sidebarLinks.slice(isMobileView ? VISIBLE_NAVBAR_ITEMS : 0);
  }, [isMobileView, sidebarLinks]);

  const value: NavigationContextType = {
    sidebarLinks,
    isStyleRounded,
    showMobileOverflowMenu,
    toggleOverflowMenu,
    handleLogout,
    mobileNavVisibleLinks,
    mobileOverflowMenuLinks,
    getSidebarLinks,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);

  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  return context;
};
