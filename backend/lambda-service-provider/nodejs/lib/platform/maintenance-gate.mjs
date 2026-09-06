import { MAINTENANCE_ALLOWLIST_ROUTE_KEYS } from "../../config/routes/index.mjs";
import { USER_ROLES } from "../../constants/auth/roles.constants.mjs";
import { getRequestContext } from "../context/request-context.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../errors/http-error.mjs";
const CACHE_TTL_MS = 30_000;

/** Default singleton values when no SystemSetting row exists yet. */
export const DEFAULT_SYSTEM_SETTINGS = Object.freeze({
  id: "default",
  maintenanceMode: false,
  maintenanceMessage: null,
  maintenanceAllowAdminAccess: true,
  featureFlags: {},
});

let cachedSettings = null;
let cachedAt = 0;

/** Clear cached system settings after an admin update. */
export const invalidateSystemSettingsCache = () => {
  cachedSettings = null;
  cachedAt = 0;
};

/**
 * Load platform system settings with a short in-memory TTL.
 *
 * @param {import("@prisma/client").PrismaClient | undefined} prisma
 * @returns {Promise<object>}
 */
export const resolveSystemSettings = async (prisma) => {
  if (!prisma) {
    return { ...DEFAULT_SYSTEM_SETTINGS };
  }

  const now = Date.now();
  if (cachedSettings && now - cachedAt < CACHE_TTL_MS) {
    return cachedSettings;
  }

  const row = await prisma.systemSetting.findUnique({
    where: { id: "default" },
  });

  cachedSettings = row ?? { ...DEFAULT_SYSTEM_SETTINGS };
  cachedAt = now;
  return cachedSettings;
};

const isAdminMaintenanceBypass = (authContext, settings) => {
  if (!settings?.maintenanceAllowAdminAccess) return false;
  return authContext?.role === USER_ROLES.ADMIN;
};

/** Routes admins may call during maintenance for recovery UI (even when admin bypass is off). */
const ADMIN_MAINTENANCE_RECOVERY_ROUTE_KEYS = new Set([
  "GET:/platform/navigation",
]);

/**
 * Block non-admin traffic when maintenance mode is enabled.
 *
 * @param {string} routeKey
 */
export const assertMaintenanceNotBlocking = async (routeKey) => {
  if (MAINTENANCE_ALLOWLIST_ROUTE_KEYS.has(routeKey)) return;

  const ctx = getRequestContext();
  if (!ctx?.prisma) return;

  const settings = await resolveSystemSettings(ctx.prisma);
  if (!settings.maintenanceMode) return;

  if (isAdminMaintenanceBypass(ctx.authContext, settings)) return;

  if (
    ctx.authContext?.role === USER_ROLES.ADMIN &&
    ADMIN_MAINTENANCE_RECOVERY_ROUTE_KEYS.has(routeKey)
  ) {
    return;
  }

  throw httpError({
    error: API_ERRORS.SERVICE_UNAVAILABLE,
    message:
      settings.maintenanceMessage ||
      "The platform is temporarily unavailable for maintenance.",
    details: ["maintenance_mode"],
  });
};
