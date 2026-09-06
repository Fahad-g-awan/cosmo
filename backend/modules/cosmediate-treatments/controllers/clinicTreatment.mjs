import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  listClinicTreatments as listClinicTreatmentsService,
  syncClinicTreatments as syncClinicTreatmentsService,
} from "../services/clinic-treatment.service.mjs";

export const syncClinicTreatments = async () => {
  try {
    return await syncClinicTreatmentsService(getRequestContext());
  } catch (error) {
    console.error("[treatments] sync clinic treatments", error);
    rethrowOrInternal(error);
  }
};

export const listClinicTreatments = async () => {
  try {
    return await listClinicTreatmentsService(getRequestContext());
  } catch (error) {
    console.error("[treatments] list clinic treatments", error);
    rethrowOrInternal(error);
  }
};
