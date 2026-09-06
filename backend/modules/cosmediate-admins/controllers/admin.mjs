import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createAdmin,
  deleteAdmin,
  getAdminByIdHandler,
  listAdmins,
  updateAdmin,
} from "../services/admin.service.mjs";

export const createAdminHandler = async () => {
  try {
    return await createAdmin(getRequestContext());
  } catch (error) {
    console.error("[admins] create", error);
    rethrowOrInternal(error);
  }
};

export const getAdmin = async () => {
  try {
    return await getAdminByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[admins] get", error);
    rethrowOrInternal(error);
  }
};

export const getAdmins = async () => {
  try {
    return await listAdmins(getRequestContext());
  } catch (error) {
    console.error("[admins] list", error);
    rethrowOrInternal(error);
  }
};

export const updateAdminHandler = async () => {
  try {
    return await updateAdmin(getRequestContext());
  } catch (error) {
    console.error("[admins] update", error);
    rethrowOrInternal(error);
  }
};

export const deleteAdminHandler = async () => {
  try {
    return await deleteAdmin(getRequestContext());
  } catch (error) {
    console.error("[admins] delete", error);
    rethrowOrInternal(error);
  }
};
