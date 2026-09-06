import {
  emitBlogNotificationEmails,
  NOTIFICATION_EMAIL_ACTION,
} from "/opt/nodejs/lib/mailer/index.mjs";
import { PERMISSIONS } from "/opt/nodejs/constants/auth/permissions/index.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { BLOG_STATUS } from "/opt/nodejs/constants/domain/blog.constants.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  logBlogCreate,
  logBlogDelete,
  logBlogUpdate,
} from "./blog-compliance.service.mjs";
import { resolveAuthorFromContext } from "../lib/auth-actor.mjs";
import { getCategoryById } from "./blog-category.repository.mjs";
import { toBlogDto, toBlogListDto } from "../lib/blog-dto.mjs";
import { isManagementRoute } from "../lib/route-scope.mjs";
import { searchBlogs } from "./blog-search.service.mjs";
import { getBlogById } from "./blog.repository.mjs";

const assertCanCreate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.BLOG.CREATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to create blogs"],
    });
  }
};

const assertCanRead = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.BLOG.READ])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to list or view blogs"],
    });
  }
};

const assertCanUpdate = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.BLOG.UPDATE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to update blogs"],
    });
  }
};

const assertCanDelete = (authContext) => {
  if (!hasPermission(authContext, [PERMISSIONS.BLOG.DELETE])) {
    throw httpError({
      error: API_ERRORS.UNAUTHORIZED,
      details: ["Not authorized to delete blogs"],
    });
  }
};

const isPublicScope = (ctx) => !isManagementRoute(ctx.routeKey);

const assertPublishedBlogVisible = (blog) => {
  if (blog?.status !== BLOG_STATUS.PUBLISHED) {
    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      details: [`Blog does not exist: ${blog?.id ?? ""}`],
    });
  }
};

export const createBlog = async (ctx) => {
  assertCanCreate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.BLOG.CREATE,
    normalizeRequest(ctx.reqBody),
  );

  const author = resolveAuthorFromContext(ctx.authContext);
  if (!author.authorId || !author.authorEmail) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Author identity is required to create a blog"],
    });
  }

  const {
    category: foundCategory,
    ok: categoryOk,
    errors: categoryErrors,
  } = await getCategoryById(ctx.prisma, reqBody.categoryId);
  if (!categoryOk) {
    throw httpError({ error: API_ERRORS.NOT_FOUND, details: categoryErrors });
  }

  const createData = {
    title: reqBody.title,
    overview: reqBody.overview,
    image: reqBody.blogImage,
    content: reqBody.content,
    status: reqBody.status,
    publishedAt: new Date(reqBody.publishedAt),
    tags: reqBody.tags,
    categoryId: foundCategory.id,
    entityType: ENTITY_TYPE.BLOG,
    ...author,
  };

  const newBlog = await ctx.prisma.blog.create({ data: createData });
  const { blog: hydrated } = await getBlogById(ctx.prisma, newBlog.id);
  const dto = toBlogDto(hydrated);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
    schemaVersion: "1",
    entityId: newBlog.id,
    entityType: ENTITY_TYPE.BLOG,
    ENV: ctx.env,
  });

  await logBlogCreate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    blog: dto,
  });

  await emitBlogNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.CREATED,
    ctx,
    entityType: "blog",
    entity: dto,
  });

  return {
    statusCode: 201,
    data: { message: "Blog created successfully", success: true, item: dto },
  };
};

export const getBlogByIdHandler = async (ctx) => {
  const blogId = ctx.queryParams?.id;
  if (!blogId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid blog ID in query params"],
    });
  }

  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { blog: foundBlog, ok } = await getBlogById(ctx.prisma, blogId);

  if (ok && isPublicScope(ctx)) {
    assertPublishedBlogVisible(foundBlog);
  }

  const from = ctx.queryParams?.from;
  if (
    ok &&
    from &&
    ["search", "listing"].includes(from) &&
    isPublicScope(ctx)
  ) {
    await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SEARCH_CLICK, {
      schemaVersion: "1",
      entityId: blogId,
      entityType: ENTITY_TYPE.ENTITY_SEARCH_STATS,
      ENV: ctx.env,
      searchStats: {
        targetEntityType: ENTITY_TYPE.BLOG,
        targetEntityId: blogId,
        source: from,
      },
    });
  }

  return {
    statusCode: 200,
    data: {
      ...(!ok ? { message: "No data found" } : {}),
      item: ok ? toBlogDto(foundBlog) : null,
      success: ok,
    },
  };
};

export const listBlogs = async (ctx) => {
  if (isManagementRoute(ctx.routeKey)) {
    assertCanRead(ctx.authContext);
  }

  const { value: query } = validateRequestBody(
    CRUD_ACTIONS.BLOG.LIST,
    normalizeRequest(ctx.reqBody),
  );
  const indexAlias = `blogs-${ctx.env}`;
  const publicOnly = isPublicScope(ctx);

  const allRecords = await searchBlogs({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
    publicOnly,
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: toBlogListDto(allRecords.items),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};

export const updateBlog = async (ctx) => {
  assertCanUpdate(ctx.authContext);

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.BLOG.UPDATE,
    normalizeRequest(ctx.reqBody),
  );

  const { id } = reqBody;
  const { blog: foundBlog, ok, errors } = await getBlogById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  let categoryId = foundBlog.categoryId;
  if (reqBody.categoryId !== undefined) {
    const {
      category: foundCategory,
      ok: categoryOk,
      errors: categoryErrors,
    } = await getCategoryById(ctx.prisma, reqBody.categoryId);
    if (!categoryOk) {
      throw httpError({ error: API_ERRORS.NOT_FOUND, details: categoryErrors });
    }
    categoryId = foundCategory.id;
  }

  const updateData = {
    ...(reqBody.title !== undefined && { title: reqBody.title }),
    ...(reqBody.overview !== undefined && { overview: reqBody.overview }),
    ...(reqBody.blogImage !== undefined && { image: reqBody.blogImage }),
    ...(reqBody.content !== undefined && { content: reqBody.content }),
    ...(reqBody.status !== undefined && { status: reqBody.status }),
    ...(reqBody.publishedAt !== undefined && {
      publishedAt: new Date(reqBody.publishedAt),
    }),
    ...(reqBody.tags !== undefined && { tags: reqBody.tags }),
    ...(reqBody.categoryId !== undefined && { categoryId }),
  };

  await ctx.prisma.blog.update({ where: { id }, data: updateData });

  const { blog: refreshed } = await getBlogById(ctx.prisma, id);
  const dto = toBlogDto(refreshed);

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
    schemaVersion: "1",
    entityId: id,
    entityType: ENTITY_TYPE.BLOG,
    ENV: ctx.env,
  });

  await logBlogUpdate({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    blog: dto,
    logData: updateData,
  });

  await emitBlogNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.UPDATED,
    ctx,
    entityType: "blog",
    entity: dto,
  });

  return {
    statusCode: 200,
    data: { message: "Blog updated successfully", success: true, item: dto },
  };
};

export const deleteBlog = async (ctx) => {
  assertCanDelete(ctx.authContext);

  const id = ctx.queryParams?.id;
  if (!id) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Blog ID is required"],
    });
  }

  const { blog: foundBlog, ok, errors } = await getBlogById(ctx.prisma, id);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  const dtoBefore = toBlogDto(foundBlog);

  await ctx.prisma.blog.update({
    where: { id },
    data: {
      deleted: true,
      deletedAt: new Date(),
    },
  });

  await emitEvent(ctx.config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
    schemaVersion: "1",
    entityId: id,
    entityType: ENTITY_TYPE.BLOG,
    ENV: ctx.env,
  });

  await logBlogDelete({
    tableName: ctx.config.DDB_MAIN_TABLE_NAME,
    authContext: ctx.authContext,
    blog: dtoBefore,
  });

  await emitBlogNotificationEmails({
    action: NOTIFICATION_EMAIL_ACTION.DELETED,
    ctx,
    entityType: "blog",
    entity: dtoBefore,
  });

  return {
    statusCode: 200,
    data: { message: "Blog deleted successfully", success: true },
  };
};

export const getRelatedBlogs = async (ctx) => {
  const blogId = ctx.queryParams?.id;
  const limit = ctx.queryParams?.limit ?? 4;

  if (!blogId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Please provide a valid blog ID in query params"],
    });
  }

  const { blog: foundBlog, ok, errors } = await getBlogById(ctx.prisma, blogId);
  if (!ok) throw httpError({ error: API_ERRORS.NOT_FOUND, details: errors });

  if (isPublicScope(ctx)) {
    assertPublishedBlogVisible(foundBlog);
  }

  const query = {
    must_not: [{ id: blogId }],
    pagination: { limit },
    sort: { by: "publishedAt", order: "desc" },
  };

  const indexAlias = `blogs-${ctx.env}`;
  const publicOnly = isPublicScope(ctx);

  let allRecords = await searchBlogs({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
    publicOnly,
    relatedMatch: {
      categoryId: foundBlog.categoryId,
      tags: foundBlog.tags ?? [],
    },
  });

  if (!allRecords.items.length) {
    allRecords = await searchBlogs({
      opsClient: ctx.opsClient,
      query,
      indexAlias,
      publicOnly,
    });
  }

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: toBlogListDto(allRecords.items),
      total: allRecords.total,
      success: allRecords.items.length > 0,
    },
  };
};

export const getTopSearchedBlogs = async (ctx) => {
  const allowZeroSearchClicks =
    ctx.queryParams?.allowZeroSearchClicks === true ||
    ctx.queryParams?.allowZeroSearchClicks === "true" ||
    ctx.queryParams?.allowZeroSearchClicks === "1";

  const query = {
    pagination: {
      limit: ctx.queryParams?.limit ?? 10,
    },
    sort: { by: "searchClicks", order: "desc" },
    filters: {
      ...(allowZeroSearchClicks ? { allowZeroSearchClicks: true } : {}),
    },
  };

  const indexAlias = `blogs-${ctx.env}`;
  const allRecords = await searchBlogs({
    opsClient: ctx.opsClient,
    query,
    indexAlias,
    publicOnly: isPublicScope(ctx),
  });

  return {
    statusCode: 200,
    data: {
      ...(!allRecords.items.length ? { message: "No data found" } : {}),
      items: toBlogListDto(allRecords.items),
      total: allRecords.total,
      nextToken: allRecords.nextToken ?? null,
      success: allRecords.items.length > 0,
    },
  };
};
