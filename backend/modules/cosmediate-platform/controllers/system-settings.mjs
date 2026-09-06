import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  getPublicSystemSettings,
  getSystemSettings,
  updateSystemSettings,
} from "../services/system-settings.service.mjs";

export const getSystemSettingsHandler = async () => {
  try {
    return await getSystemSettings(getRequestContext());
  } catch (error) {
    console.error("[platform] system-settings get", error);
    rethrowOrInternal(error);
  }
};

export const getPublicSystemSettingsHandler = async () => {
  try {
    return await getPublicSystemSettings(getRequestContext());
  } catch (error) {
    console.error("[platform] system-settings public", error);
    rethrowOrInternal(error);
  }
};

export const updateSystemSettingsHandler = async () => {
  try {
    return await updateSystemSettings(getRequestContext());
  } catch (error) {
    console.error("[platform] system-settings update", error);
    rethrowOrInternal(error);
  }
};
