"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_MAINTENANCE_MESSAGE,
  getPublicSystemSettingsApi,
  isMaintenanceOverlaySuppressedPath,
  reportMaintenanceBlocked,
  setMaintenanceBypass,
  subscribeMaintenanceBlocked,
  type MaintenanceBlockedState,
} from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import { usePathname } from "next/navigation";

import { MaintenanceBlockedOverlay } from "./MaintenanceBlockedOverlay";
import { ensureApiMaintenanceInterceptor } from "./maintenance-interceptor";

interface MaintenanceGateContextValue {
  blocked: MaintenanceBlockedState | null;
}

const MaintenanceGateContext = createContext<
  MaintenanceGateContextValue | undefined
>(undefined);

export interface MaintenanceGateProviderProps {
  children: ReactNode;
  /** Dashboard app only — show admin recovery controls on the blocking overlay. */
  adminRecovery?: boolean;
}

export const MaintenanceGateProvider = ({
  children,
  adminRecovery = false,
}: MaintenanceGateProviderProps) => {
  const [blocked, setBlocked] = useState<MaintenanceBlockedState | null>(null);
  const { session, isSessionLoading } = useAuth();
  const pathname = usePathname();
  const suppressOverlay = isMaintenanceOverlaySuppressedPath(pathname);

  const isAdmin = session?.userRole === "ADMIN";
  const showAdminRecovery =
    adminRecovery && isAdmin && Boolean(blocked) && !suppressOverlay;

  useEffect(() => {
    ensureApiMaintenanceInterceptor();
    return subscribeMaintenanceBlocked(setBlocked);
  }, []);

  useEffect(() => {
    if (isSessionLoading || suppressOverlay) return;

    let cancelled = false;

    const syncPublicMaintenance = async () => {
      const response = await getPublicSystemSettingsApi();
      if (cancelled) return;

      if (!response.success || !response.item?.maintenanceMode) {
        setMaintenanceBypass(false);
        reportMaintenanceBlocked(null);
        return;
      }

      const allowAdminAccess =
        response.item.maintenanceAllowAdminAccess ?? true;
      const adminBypass = isAdmin && allowAdminAccess;

      setMaintenanceBypass(adminBypass);

      if (adminBypass) {
        reportMaintenanceBlocked(null);
        return;
      }

      reportMaintenanceBlocked({
        message:
          response.item.maintenanceMessage || DEFAULT_MAINTENANCE_MESSAGE,
      });
    };

    void syncPublicMaintenance();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, isSessionLoading, suppressOverlay]);

  const value = useMemo(() => ({ blocked }), [blocked]);

  return (
    <MaintenanceGateContext.Provider value={value}>
      {children}
      {blocked && !suppressOverlay ? (
        <MaintenanceBlockedOverlay
          message={blocked.message}
          showAdminRecovery={showAdminRecovery}
        />
      ) : null}
    </MaintenanceGateContext.Provider>
  );
};

export const useMaintenanceGate = (): MaintenanceGateContextValue => {
  const context = useContext(MaintenanceGateContext);

  if (!context) {
    throw new Error(
      "useMaintenanceGate must be used within a MaintenanceGateProvider",
    );
  }

  return context;
};
