import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createSpecialist,
  deleteSpecialist,
  getSpecialistByIdHandler,
  getTopSearchedSpecialists,
  listSpecialists,
  listSpecialistsByTreatmentId,
  updateSpecialist,
} from "../services/specialist.service.mjs";

export const createSpecialistHandler = async () => {
  try {
    return await createSpecialist(getRequestContext());
  } catch (error) {
    console.error("[specialists] create", error);
    rethrowOrInternal(error);
  }
};

export const getSpecialist = async () => {
  try {
    return await getSpecialistByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[specialists] get", error);
    rethrowOrInternal(error);
  }
};

export const getSpecialists = async () => {
  try {
    return await listSpecialists(getRequestContext());
  } catch (error) {
    console.error("[specialists] list", error);
    rethrowOrInternal(error);
  }
};

export const listSpecialistsByTreatmentHandler = async () => {
  try {
    return await listSpecialistsByTreatmentId(getRequestContext());
  } catch (error) {
    console.error("[specialists] list by treatment", error);
    rethrowOrInternal(error);
  }
};

export const updateSpecialistHandler = async () => {
  try {
    return await updateSpecialist(getRequestContext());
  } catch (error) {
    console.error("[specialists] update", error);
    rethrowOrInternal(error);
  }
};

export const deleteSpecialistHandler = async () => {
  try {
    return await deleteSpecialist(getRequestContext());
  } catch (error) {
    console.error("[specialists] delete", error);
    rethrowOrInternal(error);
  }
};

export const getTopSearchedSpecialistsHandler = async () => {
  try {
    return await getTopSearchedSpecialists(getRequestContext());
  } catch (error) {
    console.error("[specialists] top searched", error);
    rethrowOrInternal(error);
  }
};

export { createSpecialistHandler as createSpecialist };
export { updateSpecialistHandler as updateSpecialist };
export { deleteSpecialistHandler as deleteSpecialist };
export { listSpecialistsByTreatmentHandler as listSpecialistsByTreatment };
export { getTopSearchedSpecialistsHandler as getTopSearchedSpecialists };
