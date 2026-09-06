"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  dismissNotificationApi,
  getActiveAnnouncementsApi,
  getMeNotificationsApi,
  getPublicSystemSettingsApi,
} from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import type { AnnouncementSurface, NotificationItem } from "@cosmediate/type-utils";

import { buildGuestNotifications } from "../lib/build-guest-notifications";
import { getNotificationItemKey } from "../lib/get-notification-item-key";
import { createMapNotificationItemToBanner } from "../lib/map-notification-item";
import type { ResolvedBannerItem, UserNotificationRegistry } from "../types";

interface NotificationContextValue {
  items: ResolvedBannerItem[];
  notifications: NotificationItem[];
  isLoading: boolean;
  error: string | null;
  dismiss: (item: ResolvedBannerItem) => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export interface NotificationProviderProps {
  children: ReactNode;
  surface: AnnouncementSurface;
  registry: UserNotificationRegistry;
  /** When true, guests see active announcements + public maintenance settings. */
  guestSupport?: boolean;
  /** Resolve in-app action paths (e.g. cross-app dashboard URLs on marketing surfaces). */
  resolveActionHref?: (path: string) => string;
}

export const NotificationProvider = ({
  children,
  surface,
  registry,
  guestSupport = false,
  resolveActionHref,
}: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { session, isSessionLoading } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const mapNotificationItemToBanner = useMemo(
    () => createMapNotificationItemToBanner(registry, resolveActionHref),
    [registry, resolveActionHref],
  );

  const fetchNotifications = useCallback(async () => {
    if (isSessionLoading) {
      setIsLoading(true);
      return;
    }

    if (!accessToken) {
      if (!guestSupport) {
        setNotifications([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [announcementsResponse, publicSettingsResponse] =
          await Promise.all([
            getActiveAnnouncementsApi({ surface }),
            getPublicSystemSettingsApi(),
          ]);

        if (
          !announcementsResponse.success ||
          !Array.isArray(announcementsResponse.items)
        ) {
          setNotifications([]);
          setError("Failed to load notifications");
          return;
        }

        const publicSettings =
          publicSettingsResponse.success && publicSettingsResponse.item
            ? publicSettingsResponse.item
            : null;

        setNotifications(
          buildGuestNotifications(
            announcementsResponse.items,
            publicSettings,
          ),
        );
        setError(null);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifications([]);
        setError("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getMeNotificationsApi(accessToken, { surface });

      if (response.success && Array.isArray(response.items)) {
        setNotifications(response.items);
        setError(null);
      } else {
        setNotifications([]);
        setError("Failed to load notifications");
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, guestSupport, isSessionLoading, surface]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const dismiss = useCallback(
    async (item: ResolvedBannerItem) => {
      setHiddenKeys((current) => {
        const next = new Set(current);
        next.add(item.id);
        return next;
      });

      if (item.source !== "announcement" || !item.announcementId) {
        return;
      }

      if (!accessToken) return;

      const response = await dismissNotificationApi(
        { announcementId: item.announcementId },
        accessToken,
      );

      if (!response.success) {
        setHiddenKeys((current) => {
          const next = new Set(current);
          next.delete(item.id);
          return next;
        });
        return;
      }

      setNotifications((current) =>
        current.filter(
          (notification) =>
            getNotificationItemKey(notification) !== item.id,
        ),
      );
    },
    [accessToken],
  );

  const items = useMemo(
    () =>
      notifications
        .map(mapNotificationItemToBanner)
        .filter((item) => !hiddenKeys.has(item.id)),
    [hiddenKeys, mapNotificationItemToBanner, notifications],
  );

  const value = useMemo(
    () => ({
      items,
      notifications,
      isLoading,
      error,
      dismiss,
      refetch: fetchNotifications,
    }),
    [dismiss, error, fetchNotifications, isLoading, items, notifications],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }

  return context;
};
