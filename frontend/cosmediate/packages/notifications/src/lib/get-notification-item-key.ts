import type { NotificationItem } from "@cosmediate/type-utils";

export const getNotificationItemKey = (item: NotificationItem): string => {
  if (item.source === "announcement") return `announcement:${item.id}`;
  if (item.source === "system") return `system:${item.code}`;
  return `user:${item.code}`;
};
