import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  listClinicSpecialistTreatments as listClinicSpecialistTreatmentsService,
  syncClinicAssignments as syncClinicAssignmentsService,
} from "../services/clinic-specialist-treatment.service.mjs";

export const syncClinicAssignments = async () => {
  try {
    return await syncClinicAssignmentsService(getRequestContext());
  } catch (error) {
    console.error("[treatments] sync clinic assignments", error);
    rethrowOrInternal(error);
  }
};

export const listClinicSpecialistTreatments = async () => {
  try {
    return await listClinicSpecialistTreatmentsService(getRequestContext());
  } catch (error) {
    console.error("[treatments] list clinic specialist treatments", error);
    rethrowOrInternal(error);
  }
};
