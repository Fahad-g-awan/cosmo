import { getIdentityWithProfile } from "/opt/nodejs/services/prisma/identity/read.mjs";
import { CLINIC_STATUS } from "/opt/nodejs/constants/domain/clinic.constants.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import {
  SYSTEM_NOTIFICATION_CODE,
  USER_NOTIFICATION_CODE,
} from "/opt/nodejs/constants/domain/announcement.constants.mjs";
import { requireSessionAuthContext } from "/opt/nodejs/lib/auth/authorization/session-auth.mjs";
import { resolveSystemSettings } from "/opt/nodejs/lib/platform/maintenance-gate.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  getAnnouncementById,
  listActiveAnnouncements,
} from "./announcement.repository.mjs";
import { toActiveAnnouncementListDto } from "../lib/announcement-dto.mjs";
import { normalizeSurface } from "./announcement.service.mjs";

const USER_STATUS = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  UNCONFIRMED: "UNCONFIRMED",
  PENDING: "PENDING",
};

const USER_CODE_PRIORITY = {
  [USER_NOTIFICATION_CODE.ACCOUNT_BLOCKED]: 950,
  [USER_NOTIFICATION_CODE.DEFAULT_PASSWORD]: 900,
  [USER_NOTIFICATION_CODE.VERIFY_EMAIL]: 900,
  [USER_NOTIFICATION_CODE.PROFILE_INCOMPLETE]: 850,
  [USER_NOTIFICATION_CODE.CLINIC_PENDING]: 800,
};

const buildUserNotificationCodes = async (prisma, identity, profile, role) => {
  const codes = [];

  if (identity?.status === USER_STATUS.UNCONFIRMED) {
    codes.push({
      source: "user",
      code: USER_NOTIFICATION_CODE.VERIFY_EMAIL,
      priority: USER_CODE_PRIORITY[USER_NOTIFICATION_CODE.VERIFY_EMAIL],
    });
  }

  if (identity?.status === USER_STATUS.BLOCKED) {
    codes.push({
      source: "user",
      code: USER_NOTIFICATION_CODE.ACCOUNT_BLOCKED,
      priority: USER_CODE_PRIORITY[USER_NOTIFICATION_CODE.ACCOUNT_BLOCKED],
    });
  }

  if (identity?.defaultPasswordUsed) {
    codes.push({
      source: "user",
      code: USER_NOTIFICATION_CODE.DEFAULT_PASSWORD,
      priority: USER_CODE_PRIORITY[USER_NOTIFICATION_CODE.DEFAULT_PASSWORD],
    });
  }

  if (!profile) {
    codes.push({
      source: "user",
      code: USER_NOTIFICATION_CODE.PROFILE_INCOMPLETE,
      priority: USER_CODE_PRIORITY[USER_NOTIFICATION_CODE.PROFILE_INCOMPLETE],
    });
  }

  if (role === USER_ROLES.MANAGER) {
    const managerId = profile?.id ?? null;
    if (!managerId) return codes;

    const pendingClinic = await prisma.clinic.findFirst({
      where: {
        deleted: false,
        status: CLINIC_STATUS.PENDING,
        managers: { some: { managerId } },
      },
      select: { id: true },
    });

    if (pendingClinic) {
      codes.push({
        source: "user",
        code: USER_NOTIFICATION_CODE.CLINIC_PENDING,
        priority: USER_CODE_PRIORITY[USER_NOTIFICATION_CODE.CLINIC_PENDING],
      });
    }
  }

  return codes;
};

const buildSystemNotifications = (settings) => {
  if (!settings?.maintenanceMode) return [];

  return [
    {
      source: "system",
      code: SYSTEM_NOTIFICATION_CODE.MAINTENANCE_MODE,
      title: "Maintenance in progress",
      message:
        settings.maintenanceMessage ||
        "The platform is temporarily unavailable for maintenance.",
      severity: "WARNING",
      priority: 1000,
      dismissible: false,
    },
  ];
};

const sortNotifications = (items) =>
  [...items].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

/** GET /me/notifications — unified banner feed for the current session. */
export const getMeNotifications = async (ctx) => {
  const { cognitoSub, identityId } = requireSessionAuthContext(ctx.authContext);
  const surface = normalizeSurface(ctx.queryParams?.surface);
  const role = ctx.authContext?.role ?? null;

  const resolved = await getIdentityWithProfile(
    ctx.config.POSTGRES_DB_URL,
    cognitoSub,
  );

  if (!resolved?.identity) {
    throw httpError({
      error: API_ERRORS.USER_NOT_FOUND,
      details: ["Identity record not available."],
    });
  }

  const { identity, profile } = resolved;

  const [announcements, settings] = await Promise.all([
    listActiveAnnouncements(ctx.prisma, {
      surface,
      role,
      identityId,
    }),
    resolveSystemSettings(ctx.prisma),
  ]);

  const items = sortNotifications([
    ...buildSystemNotifications(settings),
    ...toActiveAnnouncementListDto(announcements),
    ...(await buildUserNotificationCodes(ctx.prisma, identity, profile, role)),
  ]);

  return {
    statusCode: 200,
    data: {
      success: true,
      items,
    },
  };
};

/**
 * Persist dismissal for an announcement.
 */
export const dismissAnnouncement = async (ctx) => {
  const { identityId } = requireSessionAuthContext(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.ANNOUNCEMENT.DISMISS,
    normalizeRequest(ctx.reqBody),
  );

  const {
    announcement: found,
    ok,
    errors,
  } = await getAnnouncementById(ctx.prisma, reqBody.announcementId);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  if (!found.dismissible) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["This announcement cannot be dismissed"],
    });
  }

  await ctx.prisma.announcementDismissal.upsert({
    where: {
      announcementId_identityId: {
        announcementId: found.id,
        identityId,
      },
    },
    create: {
      announcementId: found.id,
      identityId,
    },
    update: {
      dismissedAt: new Date(),
    },
  });

  return {
    statusCode: 200,
    data: {
      success: true,
      message: "Announcement dismissed",
    },
  };
};
