import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createManager,
  deleteManager,
  getManagerByIdHandler,
  listManagers,
  updateManager,
} from "../services/manager.service.mjs";

export const createManagerHandler = async () => {
  try {
    return await createManager(getRequestContext());
  } catch (error) {
    console.error("[clinics] create manager", error);
    rethrowOrInternal(error);
  }
};

export const getManager = async () => {
  try {
    return await getManagerByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[clinics] get manager", error);
    rethrowOrInternal(error);
  }
};

export const getManagers = async () => {
  try {
    return await listManagers(getRequestContext());
  } catch (error) {
    console.error("[clinics] list managers", error);
    rethrowOrInternal(error);
  }
};

export const updateManagerHandler = async () => {
  try {
    return await updateManager(getRequestContext());
  } catch (error) {
    console.error("[clinics] update manager", error);
    rethrowOrInternal(error);
  }
};

export const deleteManagerHandler = async () => {
  try {
    return await deleteManager(getRequestContext());
  } catch (error) {
    console.error("[clinics] delete manager", error);
    rethrowOrInternal(error);
  }
};

export { createManagerHandler as createManager };
export { updateManagerHandler as updateManager };
export { deleteManagerHandler as deleteManager };
