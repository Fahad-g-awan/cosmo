/**
 * Role-based route prefix allowlists.
 * Used by {@link canAccessRoute} — paths match when `pathname.startsWith(prefix)`.
 * Prefer section roots (e.g. `/control-panel`, `/settings`) so nested CRUD routes inherit access.
 */
export const adminRoutes = [
  "/clinic-management",
  "/specialists",
  "/treatments",
  "/patients",
  "/blog-management",
  "/crm",
  "/activity-monitoring",
  "/audit-trail",
  "/moderation",
  "/control-panel",
  "/settings",
];

export const managerRoutes = [
  "/analytics",
  "/requests",
  "/inbox",
  "/schedule",
  "/reviews",
  "/patients",
  "/specialists",
  "/control-panel",
  "/settings",
];

export const specialistRoutes = [
  "/analytics",
  "/requests",
  "/inbox",
  "/schedule",
  "/reviews",
  "/patients",
  "/settings",
];

export const patientRoutes = [
  "/appointments",
  "/inbox",
  "/settings",
];
