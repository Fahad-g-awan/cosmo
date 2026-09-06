import {
  email,
  phone,
  clearablePhone,
  permsAdminGrantable,
} from "../shared/fragments.schema.mjs";
import { USER_STATUS_REGISTRY } from "../../../constants/auth/status.constants.mjs";
import { GRANT_REGISTRY } from "../../../constants/auth/permissions/index.mjs";
import { openSearchListBody } from "../shared/opensearch-list.schema.mjs";
import {
  String,
  Integer,
  URI,
  ClearableString,
  ClearableURI,
  ClearableInteger,
} from "../shared/primitives.schema.mjs";
import { Gender, ClearableGender } from "../shared/enums.schema.mjs";

export const PatientCreate = {
  type: "object",
  additionalProperties: false,
  required: ["email", "firstName", "lastName", "status"],
  properties: {
    email,
    patientImage: URI,
    firstName: String,
    lastName: String,
    phone,
    age: Integer,
    country: String,
    state: String,
    city: String,
    gender: Gender,
    completeAddress: String,
    postalCode: String,
    clinicId: String,
    perms: {
      type: "array",
      items: { type: "string", enum: GRANT_REGISTRY },
      uniqueItems: true,
      default: [],
    },
    status: { type: "string", enum: USER_STATUS_REGISTRY },
  },
  errorMessage: {
    required: {
      email: "Email is required",
      firstName: "First name is required",
      lastName: "Last name is required",
      status: "Status is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      email: "Email must be a valid address",
      firstName: "First name is required",
      lastName: "Last name is required",
      status: "Status is required",
    },
  },
};

export const PatientUpdate = {
  type: "object",
  additionalProperties: false,
  required: ["email", "id", "status", "firstName", "lastName"],
  properties: {
    id: String,
    email,
    patientImage: ClearableURI,
    firstName: String,
    lastName: String,
    phone: clearablePhone,
    gender: ClearableGender,
    age: ClearableInteger,
    country: ClearableString,
    state: ClearableString,
    city: ClearableString,
    completeAddress: ClearableString,
    postalCode: ClearableString,
    status: { type: "string", enum: USER_STATUS_REGISTRY },
    perms: permsAdminGrantable,
  },
  errorMessage: {
    required: {
      email: "Email is required",
      id: "Patient ID is required",
      status: "Status is required",
      firstName: "First name is required",
      lastName: "Last name is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      email: "Email must be a valid address",
      id: "Patient ID is required",
      status: "Status is required",
      firstName: "First name is invalid",
      lastName: "Last name is invalid",
      phone: "Phone number must be in international format (e.g., +1234567890)",
      age: "Age must be a valid number",
      gender: "Gender is invalid",
    },
  },
};

export const PatientList = openSearchListBody();

export const PatientDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "Patient ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Patient ID is required",
    },
  },
};
