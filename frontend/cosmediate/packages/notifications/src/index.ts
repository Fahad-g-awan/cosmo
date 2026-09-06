export type {
  MaintenanceBlockedState,
  ResolvedBannerItem,
  UserNotificationRegistry,
  UserNotificationRegistryEntry,
} from "./types";

export { buildGuestNotifications } from "./lib/build-guest-notifications";
export { getNotificationItemKey } from "./lib/get-notification-item-key";
export {
  createMapNotificationItemToBanner,
} from "./lib/map-notification-item";
export { resolveDashboardAppUrl } from "./lib/resolve-dashboard-app-url";

export { USER_NOTIFICATION_REGISTRY } from "./registries/user-notification-registry";

export {
  NotificationProvider,
  useNotifications,
  type NotificationProviderProps,
} from "./context/NotificationContext";

export { NotificationBannerStack } from "./components/NotificationBannerStack";

export { MaintenanceGateProvider, useMaintenanceGate } from "./maintenance/MaintenanceGateContext";
export type { MaintenanceGateProviderProps } from "./maintenance/MaintenanceGateContext";
export { MaintenanceBlockedOverlay } from "./maintenance/MaintenanceBlockedOverlay";
export { ensureApiMaintenanceInterceptor } from "./maintenance/maintenance-interceptor";
