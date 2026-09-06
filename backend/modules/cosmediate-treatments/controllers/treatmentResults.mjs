import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createTreatmentResult,
  deleteTreatmentResult,
  getTreatmentResultByIdHandler,
  listTreatmentResults,
  updateTreatmentResult,
} from "../services/treatment-result.service.mjs";

export const createTreatmentResultHandler = async () => {
  try {
    return await createTreatmentResult(getRequestContext());
  } catch (error) {
    console.error("[treatments] create treatment result", error);
    rethrowOrInternal(error);
  }
};

export const getTreatmentResult = async () => {
  try {
    return await getTreatmentResultByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[treatments] get treatment result", error);
    rethrowOrInternal(error);
  }
};

export const getTreatmentResults = async () => {
  try {
    return await listTreatmentResults(getRequestContext());
  } catch (error) {
    console.error("[treatments] list treatment results", error);
    rethrowOrInternal(error);
  }
};

export const updateTreatmentResultHandler = async () => {
  try {
    return await updateTreatmentResult(getRequestContext());
  } catch (error) {
    console.error("[treatments] update treatment result", error);
    rethrowOrInternal(error);
  }
};

export const deleteTreatmentResultHandler = async () => {
  try {
    return await deleteTreatmentResult(getRequestContext());
  } catch (error) {
    console.error("[treatments] delete treatment result", error);
    rethrowOrInternal(error);
  }
};

export { createTreatmentResultHandler as createTreatmentResult };
export { updateTreatmentResultHandler as updateTreatmentResult };
export { deleteTreatmentResultHandler as deleteTreatmentResult };
