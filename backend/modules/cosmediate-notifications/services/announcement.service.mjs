import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import {
  ANNOUNCEMENT_SURFACES,
} from "/opt/nodejs/constants/domain/announcement.constants.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  logAnnouncementCreate,
  logAnnouncementDelete,
  logAnnouncementUpdate,
} from "./announcement-compliance.service.mjs";
import { resolveAuthorFromContext } from "../lib/auth-actor.mjs";
import {
  toAnnouncementDto,
  toAnnouncementListDto,
  toActiveAnnouncementListDto,
} from "../lib/announcement-dto.mjs";
import {
  getAnnouncementById,
  listActiveAnnouncements,
} from "./announcement.repository.mjs";
import { searchAnnouncements } from "./announcement-search.service.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.ANNOUNCEMENT.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create announcements"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.ANNOUNCEMENT.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to list or view announcements"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.ANNOUNCEMENT.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update announcements"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.ANNOUNCEMENT.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete announcements"],
    });
  }
};

const normalizeSurface = (surface) => {
  const value = String(surface ?? "dashboard")
    .trim()
    .toLowerCase();
  return value || ANNOUNCEMENT_SURFACES.DASHBOARD;
};

const parseOptionalDate = (value) => (value ? new Date(value) : null);

export const createAnnouncement = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.ANNOUNCEMENT.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const author = resolveAuthorFromContext(ctx.authContext);
  if (!author.authorId || !author.authorEmail) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Author identity is required to create an announcement"],
    });
  }

  const createData = {
    title: reqBody.title,
    message: reqBody.message,
    severity: reqBody.severity,
    status: reqBody.status,
    priority:
      reqBody.priority != null &&
      reqBody.priority !== "" &&
      !Number.isNaN(Number(reqBody.priority))
        ? Number(reqBody.priority)
        : 0,
    startsAt: parseOptionalDate(reqBody.startsAt),
    endsAt: parseOptionalDate(reqBody.endsAt),
    dismissible: reqBody.dismissible ?? true,
    targetRoles: reqBody.targetRoles,
    targetSurfaces: reqBody.targetSurfaces,
    actionLabel: reqBody.actionLabel || null,
    actionUrl: reqBody.actionUrl || null,
    entityType: ENTITY_TYPE.ANNOUNCEMENT,
    ...author,
  };

  const newAnnouncement = await ctx.prisma.announcement.create({
    data: createData,
  });
  const dto = toAnnouncementDto(newAnnouncement);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
    schemaVersion: "1",
    entityId: newAnnouncement.id,
    entityType: ENTITY_TYPE.ANNOUNCEMENT,
    ENV: ctx.env,
  });

  await logAnnouncementCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    announcement: dto,
  });

  return {
    statusCode: 201,
    data: {
      message: "Announcement created successfully",
      success: true,
      item: dto,
    },
  };
};

export const getAnnouncementByIdHandler = async (ctx) => {
  const announcementId = ctx.queryParams?.id;
  if (!announcementId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid announcement ID in query params"],
    });
  }

  assertCanRead(ctx.authContext);

  const { announcement: found, ok } = await getAnnouncementById(
    ctx.prisma,
    announcementId,
  );

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toAnnouncementDto(found) : null,
      success: ok,
    },
  };
};

export const listAnnouncements = async (ctx) => {
  assertCanRead(ctx.authContext);

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.ANNOUNCEMENT.LIST,
    normalizeRequest(ctx.reqBody),
  );
  const indexAlias = `announcements-${ctx.env}`;

  const allRecords = await searchAnnouncements({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: toAnnouncementListDto(allRecords.items),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const updateAnnouncement = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.ANNOUNCEMENT.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const { id } = reqBody;
  const { ok, errors } = await getAnnouncementById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const updateData = {
    ...(reqBody.title !== undefined && { title: reqBody.title }),
    ...(reqBody.message !== undefined && { message: reqBody.message }),
    ...(reqBody.severity !== undefined && { severity: reqBody.severity }),
    ...(reqBody.status !== undefined && { status: reqBody.status }),
    ...(reqBody.priority !== undefined && {
      priority:
        reqBody.priority != null &&
        reqBody.priority !== "" &&
        !Number.isNaN(Number(reqBody.priority))
          ? Number(reqBody.priority)
          : 0,
    }),
    ...(reqBody.startsAt !== undefined && {
      startsAt: parseOptionalDate(reqBody.startsAt),
    }),
    ...(reqBody.endsAt !== undefined && {
      endsAt: parseOptionalDate(reqBody.endsAt),
    }),
    ...(reqBody.dismissible !== undefined && {
      dismissible: reqBody.dismissible,
    }),
    ...(reqBody.targetRoles !== undefined && {
      targetRoles: Array.isArray(reqBody.targetRoles)
        ? reqBody.targetRoles
        : [],
    }),
    ...(reqBody.targetSurfaces !== undefined && {
      targetSurfaces: Array.isArray(reqBody.targetSurfaces)
        ? reqBody.targetSurfaces
        : [],
    }),
    ...(reqBody.actionLabel !== undefined && {
      actionLabel: reqBody.actionLabel || null,
    }),
    ...(reqBody.actionUrl !== undefined && {
      actionUrl: reqBody.actionUrl || null,
    }),
  };

  await ctx.prisma.announcement.update({ where: { id }, data: updateData });

  const { announcement: refreshed } = await getAnnouncementById(ctx.prisma, id);
  const dto = toAnnouncementDto(refreshed);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: id,
    entityType: ENTITY_TYPE.ANNOUNCEMENT,
    ENV: ctx.env,
  });

  await logAnnouncementUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    announcement: dto,
    logData: updateData,
  });

  return {
    statusCode: 200,
    data: {
      message: "Announcement updated successfully",
      success: true,
      item: dto,
    },
  };
};

export const deleteAnnouncement = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Announcement ID is required"],
    });
  }

  const {
    announcement: found,
    ok,
    errors,
  } = await getAnnouncementById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toAnnouncementDto(found);

  await ctx.prisma.announcement.update({
    where: { id },
    data: {
      deleted: true,
      deletedAt: new Date(),
    },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: id,
    entityType: ENTITY_TYPE.ANNOUNCEMENT,
    ENV: ctx.env,
  });

  await logAnnouncementDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    announcement: dtoBefore,
  });

  return {
    statusCode: 200,
    data: { message: "Announcement deleted successfully", success: true },
  };
};

export const getActiveAnnouncements = async (ctx) => {
  const surface = normalizeSurface(ctx.queryParams?.surface);
  const items = await listActiveAnnouncements(ctx.prisma, { surface });

  return {
    statusCode: 200,
    data: {
      items: toActiveAnnouncementListDto(items),
      success: items.length > 0,
      ...(!items.length ? { message: "No active announcements" } : {}),
    },
  };
};

export { normalizeSurface };
