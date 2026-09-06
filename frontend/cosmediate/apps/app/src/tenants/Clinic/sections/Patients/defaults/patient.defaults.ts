import { PatientFormValues } from "../types/patient.types";

export const defaultPatientFormValues: PatientFormValues = {
  patientImage: undefined,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: undefined,
  gender: undefined,
  country: undefined,
  state: undefined,
  city: undefined,
  postalCode: undefined,
  completeAddress: undefined,
  // Force explicit status selection on create
  status: undefined as unknown as PatientFormValues["status"],
  perms: [],
};
