import {
  API_ERRORS,
} from "/opt/nodejs/constants/errors/index.mjs";
import { DateTime } from "luxon";
import { phoneOrNA } from "/opt/nodejs/utils/formatting/phone.mjs";

import {
  handleUpdateCommand,
} from "/opt/nodejs/lib/db/dynamodb/commands/update.mjs";
import {
  handleUpdateEntitySearchCount,
} from "/opt/nodejs/services/dynamodb/search-stats.mjs";
import {
  createAuditLog,
} from "/opt/nodejs/services/dynamodb/audit-log.mjs";
import {
  PERMISSIONS,
} from "/opt/nodejs/constants/auth/permissions/index.mjs";
import {
  ENTITY_TYPE,
} from "/opt/nodejs/constants/db/entity-types.mjs";
import {
  DB_EVENT,
} from "/opt/nodejs/constants/db/db-events.mjs";
import {
  DB_STREAM_COMMAND,
} from "/opt/nodejs/constants/db/stream-commands/index.mjs";
import {
  AUDIT_LOG_ACTION,
} from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import {
  LEAD_STATUS,
  LEAD_TYPE,
} from "/opt/nodejs/constants/domain/lead.constants.mjs";
import { hasPermission } from "/opt/nodejs/lib/auth/authorization/grant/permissions.utils.mjs";
import {
  rethrowOrInternal,
  httpError,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { emitEvent } from "/opt/nodejs/lib/eventBridge/config.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/api/parseBody.mjs";
import { geocodeAddress } from "/opt/nodejs/lib/location/geocode.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { verifyRecaptcha } from "/opt/nodejs/lib/recaptcha/verify.mjs";

import { getLeadDataById } from "../lib/utils.mjs";
import { openSearchQuery } from "../services/ops.mjs";

const RECAPTCHA_ACTION_MAP = {
  [LEAD_TYPE.CONTACT]: "contact_submit",
  [LEAD_TYPE.CLINIC]: "register_clinic_submit",
  [LEAD_TYPE.DOCTOR]: "register_doctor_submit",
  [LEAD_TYPE.SUBSCRIPTION]: "subscribe_submit",
};

export const createLead = async () => {
  try {
    const context = getRequestContext();
    const { config, authContext, prisma, env } = context;

    // if (
    //   !hasPermission(authContext, [PERMISSIONS.SPECIALIST.CREATE])
    // ) {
    //   throw httpError({ error: API_ERRORS.UNAUTHORIZED, details: [
    //     `Unauthorized access`,
    //     "User is not authorized to perform this action",
    //   ] });
    // }

    const normalizedBody = normalizeRequest(context.reqBody);
    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.LEAD.CREATE,
      normalizedBody,
    );

    const {
      email = "",
      phone = "",
      firstName = "",
      lastName = "",

      country = "",
      state = "",
      city = "",
      postalCode = "",
      completeAddress = "",

      subject = "",
      message = "",
      companyName = "",
      registrationNumber = "",

      type = "",
      source = "",

      recaptchaToken,
    } = reqBody;

    /**
     * ===========================================================
     * Verify reCAPTCHA v3 token
     * ===========================================================
     */
    const expectedAction = RECAPTCHA_ACTION_MAP[type];
    if (!expectedAction) {
      throw httpError({ error: API_ERRORS.BAD_REQUEST, message: "Invalid lead type for reCAPTCHA", details: [
        `Unknown lead type: ${type}`,
      ] });
    }

    await verifyRecaptcha(recaptchaToken, process.env.RECAPTCHA_SECRET_KEY, {
      expectedAction,
    });

    /**
     * ===========================================================
     * Add user in DB
     * ===========================================================
     */

    // const addressToGeocode = [completeAddress, city, state, postalCode, country]
    //   .filter(Boolean)
    //   .join(", ");
    // const { lat, lon } = await geocodeAddress(addressToGeocode, config);

    const createData = {
      email: email,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      fullName: firstName && lastName ? `${firstName} ${lastName}` : null,
      phone: phoneOrNA(phone),

      country: country ?? null,
      state: state ?? null,
      city: city ?? null,
      completeAddress: completeAddress ?? null,
      postalCode: postalCode ?? null,
      // lat: lat ?? null,
      // lon: lon ?? null,

      subject: subject ? subject : null,
      message: message ? message : null,
      companyName: companyName ? companyName : null,
      registrationNumber: registrationNumber ? registrationNumber : null,

      type,
      source: source ? source : null,
      status: LEAD_STATUS.NEW,
    };
    console.log("[Prisma Create] Create Lead data:", createData);

    const newLead = await prisma.lead.create({
      data: createData,
    });
    console.log("[Prisma Create] Create Lead response:", newLead);

    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.INSERT, {
      schemaVersion: "1",
      entityId: newLead.id,
      entityType: ENTITY_TYPE.LEAD,
      ENV: env,
    });

    return {
      statusCode: 201,
      data: {
        message: "Data created successfully",
        success: true,
        item: newLead,
      },
    };
  } catch (error) {
    console.log("Error at create lead controller:", error);
    rethrowOrInternal(error);
}
};

export const getLead = async () => {
  try {
    const context = getRequestContext();
    const { config, prisma, authContext, queryParams, env } = context;
    const { id: leadId = null, from = null } = queryParams;

    // if (
    //   authContext?.role === USER_ROLES.SPECIALIST &&
    //   !hasPermission(authContext, [PERMISSIONS.PROFILE.GET])
    // ) {
    //   throw httpError({ error: API_ERRORS.UNAUTHORIZED, details: [
    //     `Unauthorized access`,
    //     "User is not authorized to perform this action",
    //   ] });
    // }

    if (!leadId) {
      throw httpError({ error: API_ERRORS.BAD_REQUEST, details: [
        "Invalid request",
        "Please provide a valid lead ID in query params",
      ] });
    }

    const { foundLead, ok } = await getLeadDataById(prisma, leadId);

    return {
      statusCode: 200,
      data: {
        ...(!ok ? { message: "No data found" } : {}),
        item: ok ? foundLead : null,
        success: true,
      },
    };
  } catch (error) {
    console.log("Error at get lead controller", error);
    rethrowOrInternal(error);
}
};

export const getLeads = async () => {
  try {
    const context = getRequestContext();
    const { env, authContext, opsClient, reqBody, config } = context;

    // TODO: Create separate route for dashbaord with authorization
    // if (
    //   authContext?.role !== USER_ROLES.SPECIALIST &&
    //   !hasPermission(authContext, [
    //     PERMISSIONS.SPECIALIST.ADMIN_GET,
    //   ])
    // ) {
    //   throw httpError({ error: API_ERRORS.UNAUTHORIZED, details: [
    //     `Unauthorized access`,
    //     "User is not authorized to perform this action",
    //   ] });
    // }

    const query = normalizeRequest(reqBody);
    const indexAlias = `leads-${env}`;
    const allRecords = await openSearchQuery({
      opsClient,
      query,
      indexAlias,
    });

    return {
      statusCode: 200,
      data: {
        ...(!allRecords.items.length ? { message: "No data found" } : {}),
        items: allRecords.items.length ? allRecords.items : [],
        total: allRecords.total,
        nextToken: allRecords.nextToken ? allRecords.nextToken : null,
        success: true,
      },
    };
  } catch (error) {
    console.log("Error at get lead controller", error);
    rethrowOrInternal(error);
}
};

export const updateLead = async () => {
  try {
    const context = getRequestContext();
    const { config, authContext, prisma, env } = context;

    const normalizedBody = normalizeRequest(context.reqBody);
    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.LEAD.UPDATE,
      normalizedBody,
    );

    const {
      // Required fields, not to update
      id,
      email,
      firstName,
      lastName,
      phone,

      country = "",
      state = "",
      city = "",
      postalCode = "",
      completeAddress = "",

      type = "",
      source = "",
      status = "",
      subject = "",
      message = "",
      companyName = "",
      registrationNumber = "",
    } = reqBody;

    // if (
    //   id !== authContext?.userId &&
    //   !hasPermission(authContext, [PERMISSIONS.LEAD.UPDATE])
    // ) {
    //   throw httpError({ error: API_ERRORS.UNAUTHORIZED, details: [
    //     `Unauthorized access`,
    //     "User is not authorized to perform this action",
    //   ] });
    // }
    // if (
    //   id === authContext?.userId &&
    //   !hasPermission(authContext, [PERMISSIONS.LEAD.UPDATE])
    // ) {
    //   throw httpError({ error: API_ERRORS.UNAUTHORIZED, details: [
    //     `Permission denied`,
    //     "User is not allowed to update their profile",
    //     "Please contact admin",
    //   ] });
    // }

    const {
      foundLead,
      ok: foundLeadOk,
      errors: validationErrors,
    } = await getLeadDataById(prisma, id);
    if (!foundLeadOk) throw httpError({ error: API_ERRORS.NOT_FOUND, details: validationErrors });

    // const foundActor = await getUserBySub(
    //   config.DB_TABLE_NAME,
    //   authContext.sub
    // );

    const updateData = {
      ...(email !== undefined && { email }),
      ...(firstName !== undefined && { firstName: firstName || null }),
      ...(lastName !== undefined && { lastName: lastName || null }),
      ...(firstName !== undefined || lastName !== undefined
        ? {
            fullName:
              `${firstName ?? foundLead.firstName ?? ""} ${
                lastName ?? foundLead.lastName ?? ""
              }`.trim() || null,
          }
        : {}),
      ...(phone !== undefined && { phone: phoneOrNA(phone) }),
      ...(country !== undefined && { country: country || null }),
      ...(state !== undefined && { state: state || null }),
      ...(city !== undefined && { city: city || null }),
      ...(completeAddress !== undefined && {
        completeAddress: completeAddress || null,
      }),
      ...(postalCode !== undefined && { postalCode: postalCode || null }),
      ...(type !== undefined && { type }),
      ...(source !== undefined && { source: source || null }),
      ...(status !== undefined && { status }),
      ...(subject !== undefined && { subject: subject || null }),
      ...(message !== undefined && { message: message || null }),
      ...(companyName !== undefined && { companyName: companyName || null }),
      ...(registrationNumber !== undefined && {
        registrationNumber: registrationNumber || null,
      }),
    };

    console.log("[Prisma Update] Update lead data:", updateData);

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });
    console.log("[Prisma Update] Update lead response:", updatedLead);

    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
      schemaVersion: "1",
      entityId: updatedLead.id,
      entityType: ENTITY_TYPE.LEAD,
      ENV: env,
    });

    // const logData = Object.fromEntries(
    //   Object.entries({
    //     email,
    //     firstName,
    //     lastName,
    //     phone,
    //     country,
    //     state,
    //     city,
    //     postalCode,
    //     completeAddress,
    //     type,
    //     source,
    //     status,
    //     subject,
    //     message,
    //     companyName,
    //     registrationNumber,
    //   }).filter(([, v]) => v != null)
    // );
    // const authActor = {
    //   actorId: foundActor.id ?? "",
    //   actorEmail: foundActor.email ?? "",
    //   actorSub: foundActor.sub ?? "",
    //   actorRole: foundActor.role,
    // };
    // await createAuditLog(
    //   config.DB_TABLE_NAME,
    //   authActor,
    //   logData,
    //   AUDIT_LOG_ACTION.UPDATE,
    //   ENTITY_TYPE.LEAD
    // );

    return {
      statusCode: 200,
      data: {
        message: "Data updated successfully",
        success: true,
        item: updatedLead,
      },
    };
  } catch (error) {
    console.log("Error at lead update controller", error);
    rethrowOrInternal(error);
}
};

export const updateLeadStatus = async () => {
  try {
    const context = getRequestContext();
    const { config, authContext, prisma, env } = context;

    const normalizedBody = normalizeRequest(context.reqBody);
    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.LEAD.STATUS_UPDATE,
      normalizedBody,
    );

    const {
      // Required fields, not to update
      id,
      status = "",
    } = reqBody;

    // if (
    //   id !== authContext?.userId &&
    //   !hasPermission(authContext, [PERMISSIONS.LEAD.UPDATE])
    // ) {
    //   throw httpError({ error: API_ERRORS.UNAUTHORIZED, details: [
    //     `Unauthorized access`,
    //     "User is not authorized to perform this action",
    //   ] });
    // }
    // if (
    //   id === authContext?.userId &&
    //   !hasPermission(authContext, [PERMISSIONS.LEAD.UPDATE])
    // ) {
    //   throw httpError({ error: API_ERRORS.UNAUTHORIZED, details: [
    //     `Permission denied`,
    //     "User is not allowed to update their profile",
    //     "Please contact admin",
    //   ] });
    // }

    const {
      foundLead,
      ok: foundLeadOk,
      errors: validationErrors,
    } = await getLeadDataById(prisma, id);
    if (!foundLeadOk) throw httpError({ error: API_ERRORS.NOT_FOUND, details: validationErrors });

    // const foundActor = await getUserBySub(
    //   config.DB_TABLE_NAME,
    //   authContext.sub
    // );

    const updateData = {
      ...(status !== undefined && { status }),
    };

    console.log("[Prisma Update] Update lead data:", updateData);

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData,
    });
    console.log("[Prisma Update] Update lead response:", updatedLead);

    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.UPDATE, {
      schemaVersion: "1",
      entityId: updatedLead.id,
      entityType: ENTITY_TYPE.LEAD,
      ENV: env,
    });

    // const logData = Object.fromEntries(
    //   Object.entries({
    //     email,
    //     firstName,
    //     lastName,
    //     phone,
    //     country,
    //     state,
    //     city,
    //     postalCode,
    //     completeAddress,
    //     type,
    //     source,
    //     status,
    //     subject,
    //     message,
    //     companyName,
    //     registrationNumber,
    //   }).filter(([, v]) => v != null)
    // );
    // const authActor = {
    //   actorId: foundActor.id ?? "",
    //   actorEmail: foundActor.email ?? "",
    //   actorSub: foundActor.sub ?? "",
    //   actorRole: foundActor.role,
    // };
    // await createAuditLog(
    //   config.DB_TABLE_NAME,
    //   authActor,
    //   logData,
    //   AUDIT_LOG_ACTION.UPDATE,
    //   ENTITY_TYPE.LEAD
    // );

    return {
      statusCode: 200,
      data: {
        message: "Data updated successfully",
        success: true,
        item: updatedLead,
      },
    };
  } catch (error) {
    console.log("Error at lead update controller", error);
    rethrowOrInternal(error);
}
};

export const deleteLead = async () => {
  try {
    const context = getRequestContext();
    const { config, authContext, prisma, env, queryParams } = context;

    // if (!hasPermission(authContext, [PERMISSIONS.LEAD.DELETE])) {
    //   throw httpError({ error: API_ERRORS.UNAUTHORIZED, details: [
    //     `Unauthorized access`,
    //     "User is not authorized to perform this action",
    //   ] });
    // }

    // const { value: reqBody } = await validateRequestBody(
    //   CRUD_ACTIONS.LEAD.DELETE,
    //   context.reqBody
    // );

    const { id = null } = queryParams;

    // if (id === authContext.userId)
    //   throw httpError({ error: API_ERRORS.UNAUTHORIZED, details: [
    //     `Permission denied`,
    //     "User cannot delete self profile",
    //   ] });

    // const foundActor = await getUserBySub(
    //   config.DB_TABLE_NAME,
    //   authContext.sub
    // );

    const {
      foundLead,
      ok: foundLeadOk,
      errors: validationErrors,
    } = await getLeadDataById(prisma, id);
    if (!foundLeadOk) throw httpError({ error: API_ERRORS.NOT_FOUND, details: validationErrors });

    console.log("[Prisma Delete] Delete lead with ID:", id);

    const deletedLead = await prisma.lead.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: DateTime.utc().toISO(),
      },
    });
    console.log("[Prisma Delete] Delete lead response:", deletedLead);

    await emitEvent(config.EVENT_BUS_NAME, DB_EVENT.SOFT_DELETE, {
      schemaVersion: "1",
      entityId: deletedLead.id,
      entityType: ENTITY_TYPE.LEAD,
      ENV: env,
    });

    // const authActor = {
    //   actorId: foundActor.id ?? "",
    //   actorEmail: foundActor.email ?? "",
    //   actorSub: foundActor.sub ?? "",
    //   actorRole: foundActor.role ?? "",
    // };
    // const logData = {
    //   id: foundLead.id ?? "",
    //   email: foundLead.email ?? "",
    // };
    // await createAuditLog(
    //   config.DB_TABLE_NAME,
    //   authActor,
    //   logData,
    //   AUDIT_LOG_ACTION.DELETE,
    //   ENTITY_TYPE.LEAD
    // );

    return {
      statusCode: 200,
      data: {
        message: "Data deleted successfully",
        success: true,
        item: deletedLead,
      },
    };
  } catch (error) {
    console.log("Error at lead delete controller", error);
    rethrowOrInternal(error);
}
};
