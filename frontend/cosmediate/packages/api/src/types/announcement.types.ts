import type {
  ActiveAnnouncementNotification,
  Announcement,
  AnnouncementRole,
  AnnouncementSeverity,
  AnnouncementStatus,
  AnnouncementSurface,
  NotificationItem,
} from "@cosmediate/type-utils";

// ============================================
// ANNOUNCEMENT API REQUEST TYPES
// ============================================

export interface GetAnnouncementRequest {
  id: string;
}

export interface GetAnnouncementsRequest {
  filters?: Record<string, unknown>;
  search?: Record<string, unknown>;
  sort?: {
    by: string;
    order: "asc" | "desc";
  };
  pagination?: {
    page?: number;
    limit?: number;
    nextToken?: string;
  };
}

export interface GetActiveAnnouncementsRequest {
  surface?: AnnouncementSurface;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  severity?: AnnouncementSeverity;
  status?: AnnouncementStatus;
  priority?: number;
  startsAt?: string;
  endsAt?: string;
  dismissible?: boolean;
  targetRoles?: AnnouncementRole[];
  targetSurfaces?: AnnouncementSurface[];
  actionLabel?: string;
  actionUrl?: string;
}

export interface UpdateAnnouncementRequest {
  id: string;
  title?: string;
  message?: string;
  severity?: AnnouncementSeverity;
  status?: AnnouncementStatus;
  priority?: number;
  startsAt?: string;
  endsAt?: string;
  dismissible?: boolean;
  targetRoles?: AnnouncementRole[];
  targetSurfaces?: AnnouncementSurface[];
  actionLabel?: string;
  actionUrl?: string;
}

export interface DeleteAnnouncementRequest {
  id: string;
}

export interface GetMeNotificationsRequest {
  surface?: AnnouncementSurface;
}

export interface DismissNotificationRequest {
  announcementId: string;
}

// ============================================
// ANNOUNCEMENT API RESPONSE TYPES
// ============================================

export interface GetAnnouncementResponse {
  success: boolean;
  message?: string;
  item: Announcement | null;
}

export interface GetAnnouncementsResponse {
  success: boolean;
  message?: string;
  items: Announcement[];
  total?: number;
  nextToken?: string;
}

export interface GetActiveAnnouncementsResponse {
  success: boolean;
  message?: string;
  items: ActiveAnnouncementNotification[];
}

export interface CreateAnnouncementResponse {
  success: boolean;
  message: string;
  item: Announcement;
}

export interface UpdateAnnouncementResponse {
  success: boolean;
  message: string;
  item: Announcement;
}

export interface DeleteAnnouncementResponse {
  success: boolean;
  message: string;
}

export interface GetMeNotificationsResponse {
  success: boolean;
  items: NotificationItem[];
}

export interface DismissNotificationResponse {
  success: boolean;
  message: string;
}
