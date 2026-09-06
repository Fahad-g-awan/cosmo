import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createClinic,
  deleteClinic,
  getClinicByIdHandler,
  listClinics,
  listClinicsByTreatmentId,
  listPopularClinics,
  listTopSearchedClinics,
  updateClinic,
} from "../services/clinic.service.mjs";

export const createClinicHandler = async () => {
  try {
    return await createClinic(getRequestContext());
  } catch (error) {
    console.error("[clinics] create clinic", error);
    rethrowOrInternal(error);
  }
};

export const getClinic = async () => {
  try {
    return await getClinicByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[clinics] get clinic", error);
    rethrowOrInternal(error);
  }
};

export const getClinics = async () => {
  try {
    return await listClinics(getRequestContext());
  } catch (error) {
    console.error("[clinics] list clinics", error);
    rethrowOrInternal(error);
  }
};

export const updateClinicHandler = async () => {
  try {
    return await updateClinic(getRequestContext());
  } catch (error) {
    console.error("[clinics] update clinic", error);
    rethrowOrInternal(error);
  }
};

export const deleteClinicHandler = async () => {
  try {
    return await deleteClinic(getRequestContext());
  } catch (error) {
    console.error("[clinics] delete clinic", error);
    rethrowOrInternal(error);
  }
};

export const listClinicsByTreatmentHandler = async () => {
  try {
    return await listClinicsByTreatmentId(getRequestContext());
  } catch (error) {
    console.error("[clinics] list by treatment", error);
    rethrowOrInternal(error);
  }
};

export const getPopularClinicsHandler = async () => {
  try {
    return await listPopularClinics(getRequestContext());
  } catch (error) {
    console.error("[clinics] list popular", error);
    rethrowOrInternal(error);
  }
};

export const getTopSearchedClinicsHandler = async () => {
  try {
    return await listTopSearchedClinics(getRequestContext());
  } catch (error) {
    console.error("[clinics] list top searched", error);
    rethrowOrInternal(error);
  }
};

export { createClinicHandler as createClinic };
export { updateClinicHandler as updateClinic };
export { deleteClinicHandler as deleteClinic };
export { listClinicsByTreatmentHandler as listClinicsByTreatment };
export { getPopularClinicsHandler as getPopularClinics };
export { getTopSearchedClinicsHandler as getTopSearchedClinics };
