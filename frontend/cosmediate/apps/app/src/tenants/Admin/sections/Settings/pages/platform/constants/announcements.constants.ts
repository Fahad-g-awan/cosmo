export const ANNOUNCEMENT_STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Expired", value: "EXPIRED" },
] as const;

export const ANNOUNCEMENT_SEVERITY_OPTIONS = [
  { label: "Info", value: "INFO" },
  { label: "Success", value: "SUCCESS" },
  { label: "Warning", value: "WARNING" },
  { label: "Error", value: "ERROR" },
] as const;

export const ANNOUNCEMENT_SURFACE_OPTIONS = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Web", value: "web" },
  { label: "Blog", value: "blog" },
] as const;

export const ANNOUNCEMENT_ROLE_OPTIONS = [
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Specialist", value: "SPECIALIST" },
  { label: "Patient", value: "PATIENT" },
] as const;

export const ALLOWED_ANNOUNCEMENT_FIELDS = new Set([
  "title",
  "message",
  "severity",
  "status",
  "priority",
  "startsAt",
  "endsAt",
  "dismissible",
  "targetRoles",
  "targetSurfaces",
  "actionLabel",
  "actionUrl",
]);
