import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createPatient,
  deletePatient,
  getPatientByIdHandler,
  listPatients,
  updatePatient,
} from "../services/patient.service.mjs";

export const createPatientHandler = async () => {
  try {
    return await createPatient(getRequestContext());
  } catch (error) {
    console.error("[patients] create", error);
    rethrowOrInternal(error);
  }
};

export const getPatient = async () => {
  try {
    return await getPatientByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[patients] get", error);
    rethrowOrInternal(error);
  }
};

export const listPatientsHandler = async () => {
  try {
    return await listPatients(getRequestContext());
  } catch (error) {
    console.error("[patients] list", error);
    rethrowOrInternal(error);
  }
};

export const updatePatientHandler = async () => {
  try {
    return await updatePatient(getRequestContext());
  } catch (error) {
    console.error("[patients] update", error);
    rethrowOrInternal(error);
  }
};

export const deletePatientHandler = async () => {
  try {
    return await deletePatient(getRequestContext());
  } catch (error) {
    console.error("[patients] delete", error);
    rethrowOrInternal(error);
  }
};
