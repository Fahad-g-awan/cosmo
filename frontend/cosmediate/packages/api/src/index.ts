// Export API client
export { default as api } from "./axiosInstance";

// Export API functions
export * from "./apis/auth.api";
export * from "./apis/patients.api";
export * from "./apis/admins.api";
export * from "./apis/treatments";
export * from "./apis/specialist.api";
export * from "./apis/leads.api";
export * from "./apis/clinics/categories.api";
export * from "./apis/clinics/clinics.api";
export * from "./apis/clinics/manager.api";
export * from "./apis/reviews";
export * from "./apis/blogs/blogs.api";
export * from "./apis/blogs/blogCategories.api";
export * from "./apis/notifications/announcements.api";
export * from "./apis/notifications/notifications.api";
export * from "./apis/imageUpload.api";
export * from "./apis/platform.api";
export * from "./apis/platform-logs.api";
export * from "./apis/management";

// Export auth types
export type * from "./types/auth.types";

// Export user types
export type * from "./types/patient.types";

// Export admin types
export type * from "./types/admin.types";

// Export treatment types
export type * from "./types/treatment.types";

// Export review types
export type * from "./types/review.types";

// Export specialist types
export type * from "./types/specialist.types";

// Export lead types
export type * from "./types/leads.types";

// Export clinic types
export type * from "./types/clinic.types";

// Export blog types
export type * from "./types/blog.types";
export type * from "./types/blogCategory.types";
export type * from "./types/announcement.types";
export type * from "./types/system-settings.types";

// Export image types
export type * from "./types/image.types";

// Export permissions types
export type * from "./types/permissions.types";
export type * from "./types/platform-logs.types";

// Export utilities
export {
  DEFAULT_MAINTENANCE_MESSAGE,
  isApiMaintenanceFailure,
  isMaintenanceOverlaySuppressedPath,
  parseMaintenanceFromAxiosError,
  reportMaintenanceBlocked,
  setMaintenanceBypass,
  shouldReportMaintenanceBlocked,
  subscribeMaintenanceBlocked,
  MAINTENANCE_ADMIN_SETTINGS_PATH,
} from "./lib/maintenance";
export type { MaintenanceBlockedState } from "./lib/maintenance";
export { handleApiError, logApiResponse } from "./lib/utils";
export type { ApiFailureResponse } from "./lib/utils";
