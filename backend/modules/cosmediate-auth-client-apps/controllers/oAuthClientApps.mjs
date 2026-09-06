import {
  API_ERRORS,
} from "/opt/nodejs/constants/errors/index.mjs";
import { DateTime } from "luxon";

import {
  handleUpdateCommand,
} from "/opt/nodejs/lib/db/dynamodb/commands/update.mjs";
import {
  handlePutCommand,
} from "/opt/nodejs/lib/db/dynamodb/commands/put.mjs";
import {
  ENTITY_TYPE,
} from "/opt/nodejs/constants/db/entity-types.mjs";
import {
  DDB_GSI_KEYS,
} from "/opt/nodejs/constants/db/dynamodb/gsi-keys.constants.mjs";
import {
  DB_STREAM_COMMAND,
} from "/opt/nodejs/constants/db/stream-commands/index.mjs";
import { validateRequestBody } from "/opt/nodejs/lib/validation/validate.mjs";
import { normalizeRequest } from "/opt/nodejs/lib/api/parseBody.mjs";
import {
  generateLookupKey,
} from "/opt/nodejs/lib/db/record.utils.mjs";
import {
  rethrowOrInternal,
  httpError,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { CRUD_ACTIONS } from "/opt/nodejs/constants/api/crud-actions/index.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";

import {
  generateClientId,
  generateClientSecret,
  getClientAppById,
  validateClientApp,
} from "../lib/utils.mjs";
import { openSearchQuery } from "../services/ops.mjs";

export const createClientApp = async () => {
  try {
    const context = getRequestContext();
    const { config } = context;

    const normalizedBody = normalizeRequest(context.reqBody);
    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.OAUTH_CLIENT_APP.CREATE,
      normalizedBody
    );

    const {
      name = "",
      redirectURIs = [],
      description = "",
      status = "",
    } = reqBody;

    const { errors, ok } = await validateClientApp(
      config.DB_OAUTH_CLIENT_APP_TABLE_NAME,
      name
    );
    if (!ok) throw httpError({ error: API_ERRORS.CONFLICT, details: errors });

    const clientAppLookupKey = generateLookupKey(name);
    const clientId = generateClientId(name);
    const { plainSecret, hashedSecret } = await generateClientSecret();

    const putCommand = {
      PK: `OAUTH_CLIENT_APP#${clientId}`,
      SK: "METADATA",
      id: clientId,
      entityType: ENTITY_TYPE.OAUTH_CLIENT_APP,
      createdAt: DateTime.utc().toISO(),
      updatedAt: DateTime.utc().toISO(),
      deletedAt: "",
      deleted: false,

      name,
      redirectURIs,
      clientId,
      hashedSecret,
      description,
      status,

      db_stream_command: DB_STREAM_COMMAND.OAUTH_CLIENT_APP_CREATED,

      GSI1PK: `OAUTH_CLIENT_APP#${clientId}`,
      GSI1SK: ENTITY_TYPE.OAUTH_CLIENT_APP,

      GSI2PK: clientAppLookupKey,
      GSI2SK: DDB_GSI_KEYS.GSI2SK_SEARCH_LOOKUPKEY,

      GSI3PK: ENTITY_TYPE.OAUTH_CLIENT_APP,
      GSI3SK: DDB_GSI_KEYS.GSI3SK_SEARCH_ENTITY_TYPE,
    };
    console.log("Client app putCommand", JSON.stringify(putCommand));
    await handlePutCommand(config.DB_OAUTH_CLIENT_APP_TABLE_NAME, putCommand);

    return {
      statusCode: 201,
      data: {
        message: "OAuth client app created successfully",
        success: true,
        clientId,
        clientSecret: plainSecret,
        warning:
          "Store this client secret securely. It will not be shown again.",
      },
    };
  } catch (error) {
    console.log("Error at create client app controller:", error);
    rethrowOrInternal(error);
}
};

export const getClientApp = async () => {
  try {
    const context = getRequestContext();
    const { config, queryParams } = context;
    const { id: clientAppId = null } = queryParams;

    if (clientAppId) {
      const { clientApp, ok } = await getClientAppById(
        config.DB_OAUTH_CLIENT_APP_TABLE_NAME,
        clientAppId
      );

      return {
        statusCode: 200,
        data: {
          ...(!ok ? { message: "No data found" } : {}),
          item: ok ? clientApp : null,
          success: true,
        },
      };
    } else {
      throw httpError({ error: API_ERRORS.BAD_REQUEST, details: [
        "Invalid request",
        "Please provide a valid client app ID in query params",
      ] });
    }
  } catch (error) {
    console.log("Error at get client app controller", error);
    rethrowOrInternal(error);
}
};

export const getClientApps = async () => {
  try {
    const context = getRequestContext();
    const { env, opsClient, reqBody } = context;

    const query = normalizeRequest(reqBody);
    const indexAlias = `oAuth_client_apps-${env}`;
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
    console.log("Error at get clinic_category controller", error);
    rethrowOrInternal(error);
}
};

export const updateClientApp = async () => {
  try {
    const context = getRequestContext();
    const { config } = context;

    const normalizedBody = normalizeRequest(context.reqBody);
    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.OAUTH_CLIENT_APP.UPDATE,
      normalizedBody
    );

    const {
      id = "",
      name = "",
      redirectURIs = [],
      description = "",
      status = "",
    } = reqBody;

    const {
      clientApp: foundClientApp,
      ok,
      errors,
    } = await getClientAppById(config.DB_OAUTH_CLIENT_APP_TABLE_NAME, id);
    if (!ok) throw httpError({ error: API_ERRORS.BAD_REQUEST, details: errors });

    const updateCommand = {
      TableName: config.DB_OAUTH_CLIENT_APP_TABLE_NAME,
      Key: {
        PK: foundClientApp.PK,
        SK: foundClientApp.SK,
      },
      UpdateExpression: `SET
        #name = :name,
        #redirectURIs = :redirectURIs,
        #description = :description,
        #status = :status,
        #db_stream_command = :db_stream_command,
        #updatedAt = :updatedAt
      `,
      ExpressionAttributeNames: {
        "#name": "name",
        "#redirectURIs": "redirectURIs",
        "#description": "description",
        "#status": "status",
        "#db_stream_command": "db_stream_command",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":name": name ?? foundClientApp.name ?? "",
        ":redirectURIs":
          Array.isArray(redirectURIs) && redirectURIs.length > 0
            ? redirectURIs
            : foundClientApp.redirectURIs,
        ":description": description ?? foundClientApp.description ?? "",
        ":status": status ?? foundClientApp.status ?? "",
        ":db_stream_command": DB_STREAM_COMMAND.OAUTH_CLIENT_APP_UPDATED,
        ":updatedAt": DateTime.utc().toISO(),
      },
      ReturnValues: "ALL_NEW",
    };
    console.log("client_app updateCommand", updateCommand);
    await handleUpdateCommand(updateCommand);

    return {
      statusCode: 200,
      data: {
        message: "Data updated successfully",
        success: true,
      },
    };
  } catch (error) {
    console.log("Error at client_app update controller", error);
    rethrowOrInternal(error);
}
};

export const deleteClientApp = async () => {
  try {
    const context = getRequestContext();
    const { config } = context;

    const { value: reqBody } = await validateRequestBody(
      CRUD_ACTIONS.OAUTH_CLIENT_APP.DELETE,
      context.reqBody
    );

    const { id = null } = reqBody;

    const {
      clientApp: foundClientApp,
      ok,
      errors,
    } = await getClientAppById(config.DB_OAUTH_CLIENT_APP_TABLE_NAME, id);
    if (!ok) throw httpError({ error: API_ERRORS.BAD_REQUEST, details: errors });

    const updateCommand = {
      TableName: config.DB_OAUTH_CLIENT_APP_TABLE_NAME,
      Key: {
        PK: foundClientApp.PK,
        SK: foundClientApp.SK,
      },
      UpdateExpression: `SET
        #deletedAt = :deletedAt,
        #db_stream_command = :db_stream_command,
        #deleted = :deleted
      `,
      ExpressionAttributeNames: {
        "#deleted": "deleted",
        "#db_stream_command": "db_stream_command",
        "#deletedAt": "deletedAt",
      },
      ExpressionAttributeValues: {
        ":deleted": true,
        ":db_stream_command": DB_STREAM_COMMAND.OAUTH_CLIENT_APP_DELETED,
        ":deletedAt": DateTime.utc().toISO(),
      },
      ReturnValues: "ALL_NEW",
    };
    console.log("client_app updateCommand", updateCommand);
    await handleUpdateCommand(updateCommand);

    return {
      statusCode: 200,
      data: {
        message: "Data deleted successfully",
        success: true,
      },
    };
  } catch (error) {
    console.log("Error at client_app delete controller", error);
    rethrowOrInternal(error);
}
};
