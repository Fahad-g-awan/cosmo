import {
  DEFAULT_SYSTEM_SETTINGS,
  invalidateSystemSettingsCache,
  resolveSystemSettings,
} from "/opt/nodejs/lib/platform/maintenance-gate.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

const toSystemSettingsDto = (row) => ({
  id: row?.id ?? DEFAULT_SYSTEM_SETTINGS.id,
  maintenanceMode: row?.maintenanceMode ?? false,
  maintenanceMessage: row?.maintenanceMessage ?? null,
  maintenanceAllowAdminAccess: row?.maintenanceAllowAdminAccess ?? true,
  featureFlags: row?.featureFlags ?? {},
  updatedAt: row?.updatedAt ?? null,
  updatedBy: row?.updatedBy ?? null,
});

const toPublicSystemSettingsDto = (row) => ({
  maintenanceMode: row?.maintenanceMode ?? false,
  maintenanceMessage: row?.maintenanceMessage ?? null,
  maintenanceAllowAdminAccess: row?.maintenanceAllowAdminAccess ?? true,
});

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.SYSTEM_SETTING.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to read system settings"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.SYSTEM_SETTING.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update system settings"],
    });
  }
};

/**
 * Admin read singleton settings.
 */
export const getSystemSettings = async (ctx) => {
  assertCanRead(ctx.authContext);

  const row = await resolveSystemSettings(ctx.prisma);

  return {
    statusCode: 200,
    data: {
      success: true,
      item: toSystemSettingsDto(row),
    },
  };
};

/**
 * Maintenance flag for guests.
 */
export const getPublicSystemSettings = async (ctx) => {
  const row = await resolveSystemSettings(ctx.prisma);

  return {
    statusCode: 200,
    data: {
      success: true,
      item: toPublicSystemSettingsDto(row),
    },
  };
};

/**
 * Upsert singleton settings.
 */
export const updateSystemSettings = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.PLATFORM.SYSTEM_SETTINGS_UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const updateData = {
    ...(reqBody.maintenanceMode !== undefined && {
      maintenanceMode: reqBody.maintenanceMode,
    }),
    ...(reqBody.maintenanceMessage !== undefined && {
      maintenanceMessage: reqBody.maintenanceMessage,
    }),
    ...(reqBody.maintenanceAllowAdminAccess !== undefined && {
      maintenanceAllowAdminAccess: reqBody.maintenanceAllowAdminAccess,
    }),
    ...(reqBody.featureFlags !== undefined && {
      featureFlags: reqBody.featureFlags,
    }),
    updatedBy: ctx.authContext?.identityId ?? null,
  };

  const row = await ctx.prisma.systemSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      maintenanceMode: reqBody.maintenanceMode ?? false,
      maintenanceMessage: reqBody.maintenanceMessage ?? null,
      maintenanceAllowAdminAccess: reqBody.maintenanceAllowAdminAccess ?? true,
      featureFlags: reqBody.featureFlags ?? {},
      updatedBy: ctx.authContext?.identityId ?? null,
    },
    update: updateData,
  });

  invalidateSystemSettingsCache();

  return {
    statusCode: 200,
    data: {
      success: true,
      message: "System settings updated successfully",
      item: toSystemSettingsDto(row),
    },
  };
};
