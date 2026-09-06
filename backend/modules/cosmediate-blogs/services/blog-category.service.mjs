import {
  emitBlogNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  logBlogCategoryCreate,
  logBlogCategoryDelete,
  logBlogCategoryUpdate,
} from "./blog-category-compliance.service.mjs";
import {
  toBlogCategoryDto,
  toBlogCategoryListDto,
} from "../lib/blog-category-dto.mjs";
import { searchBlogCategories } from "./blog-category-search.service.mjs";
import { getCategoryById } from "./blog-category.repository.mjs";
import { isManagementRoute } from "../lib/route-scope.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.BLOG_CATEGORY.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create blog categories"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.BLOG_CATEGORY.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to list or view blog categories"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.BLOG_CATEGORY.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update blog categories"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.BLOG_CATEGORY.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete blog categories"],
    });
  }
};

const isPublicScope = (ctx) => !isManagementRoute(ctx.routeKey);

export const createBlogCategories = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.BLOG_CATEGORY.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const createData = reqBody.categories.map((category) => ({
    name: category.toLowerCase(),
    published: reqBody.published,
    entityType: ENTITY_TYPE.BLOG_CATEGORY,
  }));

  await ctx.prisma.blogCategory.createMany({ data: createData });

  const insertedItems = await ctx.prisma.blogCategory.findMany({
    where: {
      name: { in: createData.map((c) => c.name) },
      deleted: false,
    },
  });

  for (const item of insertedItems) {
    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
      schemaVersion: "1",
      entityId: item.id,
      entityType: ENTITY_TYPE.BLOG_CATEGORY,
      ENV: ctx.env,
    });

    await logBlogCategoryCreate({
      tableName: ctx.config.DDB_MAIN_TABLE_NAME,
      authContext: ctx.authContext,
      category: toBlogCategoryDto(item),
    });

    await emitBlogNotificationEmails({
      action: NOTIFICATION_EMAIL_ACTION.CREATED,
      ctx,
      entityType: "blog category",
      entity: toBlogCategoryDto(item),
    });
  }

  return {
    statusCode: 201,
    data: {
      message: "Blog category created successfully",
      success: true,
      item: toBlogCategoryListDto(insertedItems),
    },
  };
};

export const getBlogCategoryByIdHandler = async (ctx) => {
  const categoryId = ctx.queryParams?.id;
  if (!categoryId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid category ID in query params"],
    });
  }

  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { category: foundCategory, ok } = await getCategoryById(
    ctx.prisma,
    categoryId,
  );

  if (ok && isPublicScope(ctx) && foundCategory?.published !== true) {
    return {
      statusCode: 200,
      data: {
        message: "No data found",
        item: null,
        success: false,
      },
    };
  }

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toBlogCategoryDto(foundCategory) : null,
      success: ok,
    },
  };
};

export const listBlogCategories = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.BLOG_CATEGORY.LIST,
    normalizeRequest(ctx.reqBody),
  );
  const indexAlias = `blog_categories-${ctx.env}`;
  const allRecords = await searchBlogCategories({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
    publicOnly: isPublicScope(ctx),
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: toBlogCategoryListDto(allRecords.items),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const updateBlogCategory = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.BLOG_CATEGORY.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const { id } = reqBody;
  const { ok, errors } = await getCategoryById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const updateData = {
    ...(reqBody.name !== undefined && { name: reqBody.name.toLowerCase() }),
    ...(reqBody.published !== undefined && { published: reqBody.published }),
  };

  await ctx.prisma.blogCategory.update({ where: { id }, data: updateData });

  const refreshed = await ctx.prisma.blogCategory.findUnique({
    where: { id },
  });
  const dto = toBlogCategoryDto(refreshed);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: id,
    entityType: ENTITY_TYPE.BLOG_CATEGORY,
    ENV: ctx.env,
  });

  await logBlogCategoryUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    category: dto,
    logData: updateData,
  });

  await emitBlogNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    entityType: "blog category",
    entity: dto,
  });

  return {
    statusCode: 200,
    data: {
      message: "Blog category updated successfully",
      success: true,
      item: dto,
    },
  };
};

export const deleteBlogCategory = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Category ID is required"],
    });
  }

  const {
    category: foundCategory,
    ok,
    errors,
  } = await getCategoryById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toBlogCategoryDto(foundCategory);

  await ctx.prisma.blogCategory.update({
    where: { id },
    data: {
      deleted: true,
      deletedAt: new Date(),
    },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: id,
    entityType: ENTITY_TYPE.BLOG_CATEGORY,
    ENV: ctx.env,
  });

  await logBlogCategoryDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    category: dtoBefore,
  });

  await emitBlogNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    entityType: "blog category",
    entity: dtoBefore,
  });

  return {
    statusCode: 200,
    data: { message: "Blog category deleted successfully", success: true },
  };
};
