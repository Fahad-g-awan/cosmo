import {
  emitReviewNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
  REVIEW_NOTIFICATION_SUBJECT,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

import {
  resolveReplyAuthorRole,
  resolveTargetDisplayName,
  resolveTargetEntityType,
  validateReplyOwnership,
} from "../lib/review-domain.mjs";
import {
  createReviewReplyRecord,
  decrementReviewReplyCount,
  findAuthorById,
  findReviewById,
  findReviewReplyById,
  findTargetEntity,
  incrementReviewReplyCount,
  softDeleteReviewReplyRecord,
  updateReviewReplyRecord,
} from "./review.repository.mjs";
import {
  emitReviewSocketEvent,
  SOCKET_EVENTS,
} from "./review-socket.service.mjs";
import {
  isManagementRoute,
  resolveReviewListFilters,
} from "../lib/route-scope.mjs";
import { searchReviewReplies } from "./review-search.service.mjs";

const VALID_REPLY_AUTHOR_ROLES = ["CLINIC", "SPECIALIST", "ADMIN"];

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.REVIEW_REPLY.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create review replies"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.REVIEW_REPLY.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update review replies"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.REVIEW_REPLY.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete review replies"],
    });
  }
};

const assertCanReadManagement = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.REVIEW_REPLY.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to view review replies"],
    });
  }
};

const publishReplyEvent = async (config, env, eventType, entityId) => {
  await emitEvent(config.EVENT_BUS_NAME, eventType, {
    schemaVersion: "1",
    entityId,
    entityType: ENTITY_TYPE.REVIEW_REPLY,
    ENV: env,
  });
};

const publishReviewReplyCountEvent = async (config, env, reviewId) => {
  await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: reviewId,
    entityType: ENTITY_TYPE.REVIEW,
    ENV: env,
    commands: { isReplyCountUpdate: true },
  });
};

export const createReviewReply = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.REVIEW_REPLY.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const {
    reviewId,
    authorId,
    authorRole,
    targetEntity,
    targetEntityId,
    comment,
  } = reqBody;

  const normalizedAuthorRole = resolveReplyAuthorRole(authorRole);
  if (!VALID_REPLY_AUTHOR_ROLES.includes(normalizedAuthorRole)) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "Invalid author role for reply",
        `Expected one of: ${VALID_REPLY_AUTHOR_ROLES.join(", ")}, received: ${authorRole}`,
      ],
    });
  }

  const {
    review: parentReview,
    errors: reviewErrors,
    ok: reviewOk,
  } = await findReviewById(ctx.prisma, reviewId);
  if (!reviewOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: reviewErrors });
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

  const newReply = await createReviewReplyRecord(ctx.prisma, {
    reviewId,
    targetEntityType,
    targetEntityId,
    targetName: resolveTargetDisplayName(targetEntityType, foundEntity),
    targetEmail: foundEntity?.email,
    targetImage: foundEntity?.image ?? foundEntity?.logo,
    targetCompleteAddress: foundEntity?.completeAddress,
    authorRole: normalizedAuthorRole,
    authorId,
    authorName: foundAuthor.fullName,
    authorEmail: foundAuthor.email,
    authorImage: foundAuthor.image,
    authorCompleteAddress: foundAuthor.completeAddress,
    comment,
    status: "PUBLISHED",
    entityType: ENTITY_TYPE.REVIEW_REPLY,
  });

  await publishReplyEvent(ctx.config, ctx.env, DB_EVENT.INSERT, newReply.id);
  await incrementReviewReplyCount(ctx.prisma, reviewId);
  await publishReviewReplyCountEvent(ctx.config, ctx.env, reviewId);

  await emitReviewSocketEvent({
    socketClient: ctx.socketClient,
    env: ctx.env,
    eventType: SOCKET_EVENTS.REVIEW_REPLY_ADDED,
    data: newReply,
  });

  await emitReviewNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.CREATED,
    subject: REVIEW_NOTIFICATION_SUBJECT.REPLY,
    ctx,
    review: parentReview,
    reply: newReply,
  });

  return {
    statusCode: 201,
    data: {
      message: "Review reply created successfully",
      success: true,
      item: newReply,
    },
  };
};

export const getReviewReplyById = async (ctx) => {
  const replyId = ctx.queryParams?.id;
  if (!replyId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "Invalid request",
        "Review reply ID is required in query params",
      ],
    });
  }

  if (isManagementRoute(ctx.routeKey)) {
    assertCanReadManagement(ctx.authContext);
  }

  const { reply, ok } = await findReviewReplyById(ctx.prisma, replyId);

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? reply : null,
      success: true,
    },
  };
};

export const listReviewReplies = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanReadManagement(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.REVIEW_REPLY.LIST,
    normalizeRequest(ctx.reqBody),
  );

  const indexAlias = `review_replies-${ctx.env}`;
  const result = await searchReviewReplies({
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

export const updateReviewReply = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.REVIEW_REPLY.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const {
    id,
    authorId,
    authorRole,
    targetEntity,
    targetEntityId,
    comment,
    status,
    reviewId,
  } = reqBody;

  const {
    reply: foundReply,
    errors: replyErrors,
    ok: replyOk,
  } = await findReviewReplyById(ctx.prisma, id);
  if (!replyOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: replyErrors });
  }

  const targetEntityType = resolveTargetEntityType(targetEntity);
  const actualReviewId = reviewId || foundReply.reviewId;

  const { errors: ownershipErrors, ok: ownershipOk } = validateReplyOwnership(
    foundReply,
    authorId,
    authorRole,
    actualReviewId,
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

  const updatedReply = await updateReviewReplyRecord(ctx.prisma, id, {
    ...(comment !== undefined && { comment }),
    ...(status !== undefined && { status }),
  });

  await publishReplyEvent(
    ctx.config,
    ctx.env,
    DB_EVENT.UPDATE,
    updatedReply.id,
  );
  await emitReviewSocketEvent({
    socketClient: ctx.socketClient,
    env: ctx.env,
    eventType: SOCKET_EVENTS.REVIEW_REPLY_UPDATED,
    data: updatedReply,
  });

  const { review: parentReview } = await findReviewById(
    ctx.prisma,
    updatedReply.reviewId,
  );

  await emitReviewNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    subject: REVIEW_NOTIFICATION_SUBJECT.REPLY,
    ctx,
    review: parentReview ?? { id: updatedReply.reviewId },
    reply: updatedReply,
  });

  return {
    statusCode: 200,
    data: {
      message: "Review reply updated successfully",
      success: true,
      item: updatedReply,
    },
  };
};

export const deleteReviewReply = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.REVIEW_REPLY.DELETE,
    ctx.reqBody,
  );

  const { id, authorId, authorRole, targetEntity, targetEntityId } = reqBody;
  const targetEntityType = resolveTargetEntityType(targetEntity);

  const {
    reply: foundReply,
    errors: replyErrors,
    ok: replyOk,
  } = await findReviewReplyById(ctx.prisma, id);
  if (!replyOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: replyErrors });
  }

  const { errors: ownershipErrors, ok: ownershipOk } = validateReplyOwnership(
    foundReply,
    authorId,
    authorRole,
    foundReply.reviewId,
    targetEntityType,
    targetEntityId,
  );
  if (!ownershipOk) {
    throw httpError({ error: API_ERRORS.FORBIDDEN, details: ownershipErrors });
  }

  await softDeleteReviewReplyRecord(ctx.prisma, id);
  await publishReplyEvent(ctx.config, ctx.env, DB_EVENT.SOFT_DELETE, id);
  await decrementReviewReplyCount(ctx.prisma, foundReply.reviewId);
  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: foundReply.reviewId,
    entityType: ENTITY_TYPE.REVIEW,
    ENV: ctx.env,
    commands: { isReplyCountUpdate: true },
  });

  await emitReviewSocketEvent({
    socketClient: ctx.socketClient,
    env: ctx.env,
    eventType: SOCKET_EVENTS.REVIEW_REPLY_DELETED,
    data: {
      id,
      reviewId: foundReply.reviewId,
      targetEntityType,
      targetEntityId,
    },
  });

  const { review: parentReview } = await findReviewById(
    ctx.prisma,
    foundReply.reviewId,
  );

  await emitReviewNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    subject: REVIEW_NOTIFICATION_SUBJECT.REPLY,
    ctx,
    review: parentReview ?? { id: foundReply.reviewId },
    reply: foundReply,
  });

  return {
    statusCode: 200,
    data: {
      message: "Review reply deleted successfully",
      success: true,
    },
  };
};
