import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createTreatment,
  deleteTreatment,
  getTopSearchedTreatments,
  getTreatmentByIdHandler,
  listTreatments,
  updateTreatment,
} from "../services/treatment.service.mjs";

export const createTreatmentHandler = async () => {
  try {
    return await createTreatment(getRequestContext());
  } catch (error) {
    console.error("[treatments] create treatment", error);
    rethrowOrInternal(error);
  }
};

export const getTreatment = async () => {
  try {
    return await getTreatmentByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[treatments] get treatment", error);
    rethrowOrInternal(error);
  }
};

export const getTreatments = async () => {
  try {
    return await listTreatments(getRequestContext());
  } catch (error) {
    console.error("[treatments] list treatments", error);
    rethrowOrInternal(error);
  }
};

export const getTopSearchedTreatmentsHandler = async () => {
  try {
    return await getTopSearchedTreatments(getRequestContext());
  } catch (error) {
    console.error("[treatments] top searched", error);
    rethrowOrInternal(error);
  }
};

export const updateTreatmentHandler = async () => {
  try {
    return await updateTreatment(getRequestContext());
  } catch (error) {
    console.error("[treatments] update treatment", error);
    rethrowOrInternal(error);
  }
};

export const deleteTreatmentHandler = async () => {
  try {
    return await deleteTreatment(getRequestContext());
  } catch (error) {
    console.error("[treatments] delete treatment", error);
    rethrowOrInternal(error);
  }
};

export { createTreatmentHandler as createTreatment };
export { updateTreatmentHandler as updateTreatment };
export { deleteTreatmentHandler as deleteTreatment };
export { getTopSearchedTreatmentsHandler as getTopSearchedTreatments };
