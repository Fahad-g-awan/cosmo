import { EntityMetadata } from "./shared";

export type AnnouncementStatus = "DRAFT" | "ACTIVE" | "EXPIRED";

export type AnnouncementSeverity = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export type AnnouncementSurface = "dashboard" | "web" | "blog";

export type AnnouncementRole = "ADMIN" | "MANAGER" | "SPECIALIST" | "PATIENT";

export type UserNotificationCode =
  | "VERIFY_EMAIL"
  | "PROFILE_INCOMPLETE"
  | "DEFAULT_PASSWORD"
  | "ACCOUNT_BLOCKED"
  | "CLINIC_PENDING";

export type SystemNotificationCode = "MAINTENANCE_MODE";

export interface Announcement extends EntityMetadata {
  title: string;
  message: string;
  severity: AnnouncementSeverity;
  status: AnnouncementStatus;
  priority: number;
  startsAt: string | null;
  endsAt: string | null;
  dismissible: boolean;
  targetRoles: AnnouncementRole[];
  targetSurfaces: AnnouncementSurface[];
  actionLabel: string | null;
  actionUrl: string | null;
  searchClicks: number;
  authorId: string;
  authorName: string;
  authorEmail: string;
}

export interface AnnouncementAction {
  label: string;
  href: string;
}

export interface ActiveAnnouncementNotification {
  source: "announcement";
  id: string;
  title: string;
  message: string;
  severity: AnnouncementSeverity;
  dismissible: boolean;
  priority: number;
  action: AnnouncementAction | null;
}

export interface SystemNotification {
  source: "system";
  code: SystemNotificationCode;
  title: string;
  message: string;
  severity: "WARNING";
  priority: number;
  dismissible: false;
}

export interface UserCodeNotification {
  source: "user";
  code: UserNotificationCode;
  priority: number;
}

export type NotificationItem =
  | ActiveAnnouncementNotification
  | SystemNotification
  | UserCodeNotification;
