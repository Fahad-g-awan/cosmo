import type {
  ActiveAnnouncementNotification,
  NotificationItem,
  PublicSystemSettings,
  SystemNotification,
} from "@cosmediate/type-utils";

const buildMaintenanceNotification = (
  settings: PublicSystemSettings,
): SystemNotification | null => {
  if (!settings.maintenanceMode) return null;

  return {
    source: "system",
    code: "MAINTENANCE_MODE",
    title: "Maintenance in progress",
    message:
      settings.maintenanceMessage ||
      "The platform is temporarily unavailable for maintenance.",
    severity: "WARNING",
    priority: 1000,
    dismissible: false,
  };
};

const sortNotifications = (items: NotificationItem[]) =>
  [...items].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

export const buildGuestNotifications = (
  announcements: ActiveAnnouncementNotification[],
  publicSettings: PublicSystemSettings | null,
): NotificationItem[] => {
  const items: NotificationItem[] = [];
  const maintenance = publicSettings
    ? buildMaintenanceNotification(publicSettings)
    : null;

  if (maintenance) {
    items.push(maintenance);
  }

  items.push(...announcements);

  return sortNotifications(items);
};
