import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  getEntityByLookupKey,
  getEntityById,
} from "/opt/nodejs/services/dynamodb/entity-queries.mjs";
import {
  ENTITY_TYPE,
} from "/opt/nodejs/constants/db/entity-types.mjs";
import {
  generateLookupKey,
} from "/opt/nodejs/lib/db/record.utils.mjs";

export const validateClientApp = async (tableName, name) => {
  try {
    const errors = [];

    const clientAppLookupKey = generateLookupKey(name);
    const foundClientApp = await getEntityByLookupKey(
      tableName,
      clientAppLookupKey
    );

    if (foundClientApp) errors.push(`Client app already exists: ${name}`);

    return { errors, ok: errors.length > 0 ? false : true };
  } catch (error) {
    console.error("Error occurred at validateClientApp:", error);
    throw error;
  }
};

export const getClientAppById = async (tableName, clientAppId) => {
  try {
    if (!clientAppId) return { clientApp: null, errors: [], ok: false };
    const errors = [];

    const GSI1PK = `OAUTH_CLIENT_APP#${clientAppId}`;
    const GSI1SK = ENTITY_TYPE.OAUTH_CLIENT_APP;
    const foundClientApp = await getEntityById(tableName, GSI1PK, GSI1SK);
    if (!foundClientApp)
      errors.push(`Client app does not exists: ${clientAppId}`);

    return {
      errors,
      clientApp: foundClientApp,
      ok: errors.length > 0 ? false : true,
    };
  } catch (error) {
    console.error("Error occurred at getClientAppById:", error);
    throw error;
  }
};

export const generateClientId = (clientName = "") => {
  const randomBytes = crypto.randomBytes(32);
  const clientId = randomBytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${clientName}_${clientId}`;
};

export const generateClientSecret = async () => {
  const randomBytes = crypto.randomBytes(48);
  const plainSecret = randomBytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const finalSecret = `secret_${plainSecret}`;
  const hashedSecret = await bcrypt.hash(finalSecret, 10);

  return {
    plainSecret: finalSecret,
    hashedSecret,
  };
};

export const verifyClientSecret = async (plainSecret, hashedSecret) => {
  try {
    return await bcrypt.compare(plainSecret, hashedSecret);
  } catch (error) {
    console.error("Error verifying client secret:", error);
    return false;
  }
};
