import {
  emitReviewNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
  REVIEW_NOTIFICATION_SUBJECT,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { syncTargetRatingAggregates } from "/opt/nodejs/services/prisma/review/rating-aggregates.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  resolveTargetDisplayName,
  resolveTargetEntityType,
  validateReviewOwnership,
} from "../lib/review-domain.mjs";
import {
  createReviewRecord,
  findAuthorById,
  findReviewById,
  findTargetEntity,
  softDeleteReviewRecord,
  updateReviewRecord,
} from "./review.repository.mjs";
import {
  emitReviewSocketEvent,
  SOCKET_EVENTS,
} from "./review-socket.service.mjs";
import {
  isManagementRoute,
  resolveReviewListFilters,
} from "../lib/route-scope.mjs";
import { searchReviews } from "./review-search.service.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.REVIEW.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create reviews"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.REVIEW.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update reviews"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.REVIEW.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete reviews"],
    });
  }
};

const assertCanReadManagement = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.REVIEW.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view reviews"],
    });
  }
};

const publishReviewEvent = async (
  config,
  env,
  eventType,
  entityId,
  commands,
) => {
  await emitEvent(config.EVENT_BUS_NAME, eventType, {
    schemaVersion: "1",
    entityId,
    entityType: ENTITY_TYPE.REVIEW,
    ENV: env,
    ...(commands ? { commands } : {}),
  });
};

const refreshTargetRatings = async (
  prisma,
  targetEntityType,
  targetEntityId,
) => {
  if (!targetEntityType || !targetEntityId) return;
  await syncTargetRatingAggregates(prisma, targetEntityType, targetEntityId);
};

export const createReview = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.REVIEW.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const {
    authorId,
    authorRole,
    targetEntity,
    targetEntityId,
    comment,
    rating,
  } = reqBody;

  if (authorRole !== USER_ROLES.PATIENT) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "Only patients can create reviews",
        `Expected role: ${USER_ROLES.PATIENT}, received: ${authorRole}`,
      ],
    });
  }

  const targetEntityType = resolveTargetEntityType(targetEntity);

  const {
    foundEntity,
    errors: entityErrors,
    ok: entityOk,
  } = await findTargetEntity(ctx.prisma, targetEntityType, targetEntityId);
  if (!entityOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: entityErrors });
  }

  const {
    user: foundAuthor,
    errors: userErrors,
    ok: userOk,
  } = await findAuthorById(ctx.prisma, authorId);
  if (!userOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: userErrors });
  }

  const newReview = await createReviewRecord(ctx.prisma, {
    targetEntityType,
    targetEntityId,
    targetName: resolveTargetDisplayName(targetEntityType, foundEntity),
    targetEmail: foundEntity?.email,
    targetImage: foundEntity?.image ?? foundEntity?.logo,
    targetCompleteAddress: foundEntity?.completeAddress,
    authorId,
    authorRole,
    authorName: foundAuthor.fullName,
    authorEmail: foundAuthor.email,
    authorImage: foundAuthor.image,
    authorCompleteAddress: foundAuthor.completeAddress,
    rating: rating ?? 0,
    comment: comment || null,
    status: "PUBLISHED",
    entityType: ENTITY_TYPE.REVIEW,
  });

  await refreshTargetRatings(ctx.prisma, targetEntityType, targetEntityId);
  await publishReviewEvent(ctx.config, ctx.env, DB_EVENT.INSERT, newReview.id);
  await emitReviewSocketEvent({
    socketClient: ctx.socketClient,
    env: ctx.env,
    eventType: SOCKET_EVENTS.REVIEW_ADDED,
    data: newReview,
  });

  await emitReviewNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.CREATED,
    subject: REVIEW_NOTIFICATION_SUBJECT.REVIEW,
    ctx,
    review: newReview,
  });

  return {
    statusCode: 201,
    data: {
      message: "Review created successfully",
      success: true,
      item: newReview,
    },
  };
};

export const getReviewById = async (ctx) => {
  const reviewId = ctx.queryParams?.id;
  if (!reviewId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Invalid request", "Review ID is required in query params"],
    });
  }

  if (isManagementRoute(ctx.routeKey)) {
    assertCanReadManagement(ctx.authContext);
  }

  const { review, ok } = await findReviewById(ctx.prisma, reviewId);

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? review : null,
      success: true,
    },
  };
};

export const listReviews = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanReadManagement(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.REVIEW.LIST,
    normalizeRequest(ctx.reqBody),
  );
  const indexAlias = `reviews-${ctx.env}`;
  const result = await searchReviews({
    opsClient: ctx.opsClient,
    query: {
      ...query,
      filters: resolveReviewListFilters(ctx.routeKey, query?.filters ?? {}),
    },
    indexAlias,
  });

  return {
    statusCode: 200,
    data: {
      ...(!result.items.length ? { message: "No data found" } : {}),
      items: result.items,
      total: result.total,
      nextToken: result.nextToken ?? null,
      success: true,
    },
  };
};

export const updateReview = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.REVIEW.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const {
    id,
    authorId,
    targetEntity,
    targetEntityId,
    comment,
    rating,
    status,
  } = reqBody;

  const targetEntityType = resolveTargetEntityType(targetEntity);

  const {
    review: foundReview,
    errors: reviewErrors,
    ok: reviewOk,
  } = await findReviewById(ctx.prisma, id);
  if (!reviewOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: reviewErrors });
  }

  const { errors: ownershipErrors, ok: ownershipOk } = validateReviewOwnership(
    foundReview,
    authorId,
    targetEntityType,
    targetEntityId,
  );
  if (!ownershipOk) {
    throw httpError({ error: API_ERRORS.FORBIDDEN, details: ownershipErrors });
  }

  const { errors: entityErrors, ok: entityOk } = await findTargetEntity(
    ctx.prisma,
    targetEntityType,
    targetEntityId,
  );
  if (!entityOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: entityErrors });
  }

  const updatedReview = await updateReviewRecord(ctx.prisma, id, {
    ...(comment !== undefined && { comment }),
    ...(rating !== undefined && { rating }),
    ...(status !== undefined && { status }),
  });

  await refreshTargetRatings(ctx.prisma, targetEntityType, targetEntityId);
  await publishReviewEvent(
    ctx.config,
    ctx.env,
    DB_EVENT.UPDATE,
    updatedReview.id,
  );
  await emitReviewSocketEvent({
    socketClient: ctx.socketClient,
    env: ctx.env,
    eventType: SOCKET_EVENTS.REVIEW_UPDATED,
    data: updatedReview,
  });

  await emitReviewNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    subject: REVIEW_NOTIFICATION_SUBJECT.REVIEW,
    ctx,
    review: updatedReview,
  });

  return {
    statusCode: 200,
    data: {
      message: "Review updated successfully",
      success: true,
      item: updatedReview,
    },
  };
};

export const deleteReview = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.REVIEW.DELETE,
    ctx.reqBody,
  );

  const { id, authorId, targetEntity, targetEntityId } = reqBody;
  const targetEntityType = resolveTargetEntityType(targetEntity);

  const {
    review: foundReview,
    errors: reviewErrors,
    ok: reviewOk,
  } = await findReviewById(ctx.prisma, id);
  if (!reviewOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: reviewErrors });
  }

  const { errors: ownershipErrors, ok: ownershipOk } = validateReviewOwnership(
    foundReview,
    authorId,
    targetEntityType,
    targetEntityId,
  );
  if (!ownershipOk) {
    throw httpError({ error: API_ERRORS.FORBIDDEN, details: ownershipErrors });
  }

  await softDeleteReviewRecord(ctx.prisma, id);
  await refreshTargetRatings(ctx.prisma, targetEntityType, targetEntityId);
  await publishReviewEvent(ctx.config, ctx.env, DB_EVENT.SOFT_DELETE, id);
  await emitReviewSocketEvent({
    socketClient: ctx.socketClient,
    env: ctx.env,
    eventType: SOCKET_EVENTS.REVIEW_DELETED,
    data: { id, targetEntityType, targetEntityId },
  });

  await emitReviewNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    subject: REVIEW_NOTIFICATION_SUBJECT.REVIEW,
    ctx,
    review: foundReview,
  });

  return {
    statusCode: 200,
    data: {
      message: "Review deleted successfully",
      success: true,
    },
  };
};
