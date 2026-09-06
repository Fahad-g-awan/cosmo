import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  getSubTreatment as getSubTreatmentService,
  getSubTreatments as getSubTreatmentsService,
  getTreatmentsFilterData as getTreatmentsFilterDataService,
  syncClinicSubTreatments as syncClinicSubTreatmentsService,
} from "../services/sub-treatment.service.mjs";

export const syncClinicSubTreatments = async () => {
  try {
    return await syncClinicSubTreatmentsService(getRequestContext());
  } catch (error) {
    console.error("[treatments] sync clinic sub-treatments", error);
    rethrowOrInternal(error);
  }
};

export const getSubTreatment = async () => {
  try {
    return await getSubTreatmentService(getRequestContext());
  } catch (error) {
    console.error("[treatments] get sub-treatment", error);
    rethrowOrInternal(error);
  }
};

export const getSubTreatments = async () => {
  try {
    return await getSubTreatmentsService(getRequestContext());
  } catch (error) {
    console.error("[treatments] list sub-treatments", error);
    rethrowOrInternal(error);
  }
};

export const getTreatmentsFilterData = async () => {
  try {
    return await getTreatmentsFilterDataService(getRequestContext());
  } catch (error) {
    console.error("[treatments] treatments filter data", error);
    rethrowOrInternal(error);
  }
};
