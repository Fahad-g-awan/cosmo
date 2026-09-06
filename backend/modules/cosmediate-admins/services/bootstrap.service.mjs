import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/http/normalize-request.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { withSuperAccess } from "/opt/nodejs/config/auth/super-access.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { countActiveAdmins } from "./admin.repository.mjs";
import { createAdminRecord } from "./admin.service.mjs";

export const bootstrapAdmin = async (ctx) => {
  const count = await countActiveAdmins(ctx.prisma);
  if (count > 0) {
    throw httpError({
      error: API_ERRORS.CONFLICT,
      details: [
        "Bootstrap is only allowed when no active admins exist",
        "Use POST /admins with an authenticated admin instead",
      ],
    });
  }

  const { value: reqBody } = validateRequestBody(
    CRUD_ACTIONS.ADMIN.BOOTSTRAP,
    normalizeRequest(ctx.reqBody),
  );

  const item = await createAdminRecord({
    config: ctx.config,
    prisma: ctx.prisma,
    authContext: null,
    env: ctx.env,
    reqBody,
    defaultPerms: withSuperAccess(),
    skipPermissionCheck: true,
  });

  return {
    statusCode: 201,
    data: {
      message: "Bootstrap admin created successfully",
      success: true,
      item,
    },
  };
};
