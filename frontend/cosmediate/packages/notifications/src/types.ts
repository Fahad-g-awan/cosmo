import type { UserNotificationCode } from "@cosmediate/type-utils";
import type { BannerNotificationVariant } from "@cosmediate/ui";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { NotificationItem } from "@cosmediate/type-utils";

export interface UserNotificationRegistryEntry {
  title: string;
  description: string;
  variant: BannerNotificationVariant;
  dismissible: boolean;
  icon: LucideIcon;
  action?: {
    label: string;
    path: string;
  };
}

export type UserNotificationRegistry = Record<
  UserNotificationCode,
  UserNotificationRegistryEntry
>;

export interface ResolvedBannerItem {
  id: string;
  announcementId?: string;
  source: NotificationItem["source"];
  title: string;
  description: string;
  icon: ReactNode;
  variant: BannerNotificationVariant;
  dismissible: boolean;
  btnAction?: ReactNode;
}

export interface MaintenanceBlockedState {
  message: string;
}
