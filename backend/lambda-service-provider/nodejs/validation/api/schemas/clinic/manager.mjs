import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import {
  String,
  Integer,
  URI,
  ClearableString,
  ClearableURI,
  ClearableInteger,
} from "../../shared/primitives.schema.mjs";
import {
  perms,
  email,
  phone,
  clearablePhone,
} from "../../shared/fragments.schema.mjs";
import { enums, Gender, ClearableGender } from "../../shared/enums.schema.mjs";

export const ManagerCreate = {
  type: "object",
  additionalProperties: false,
  required: ["email", "firstName", "lastName", "clinicIds", "status"],
  properties: {
    parentClinicId: String,
    clinicIds: { type: "array", minItems: 1, maxItems: 1, items: String },
    email,
    managerImage: URI,
    firstName: String,
    lastName: String,
    phone,
    gender: Gender,
    age: Integer,
    country: String,
    state: String,
    city: String,
    completeAddress: String,
    postalCode: String,
    perms,
    status: { type: "string", enum: enums.userStatus },
  },
  errorMessage: {
    required: {
      email: "Email is required",
      firstName: "First name is required",
      lastName: "Last name is required",
      clinicIds: "Please select a clinic",
      status: "Status is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      email: "Email must be a valid address",
      firstName: "First name is required",
      lastName: "Last name is required",
      clinicIds: "Please select a clinic",
      status: "Status is required",
    },
  },
};

export const ManagerUpdate = {
  type: "object",
  additionalProperties: false,
  required: ["id", "email", "firstName", "lastName", "status"],
  properties: {
    id: String,
    parentClinicId: String,
    clinicIds: { type: "array", minItems: 1, items: String },
    email,
    managerImage: ClearableURI,
    firstName: String,
    lastName: String,
    phone: clearablePhone,
    age: ClearableInteger,
    gender: ClearableGender,
    country: ClearableString,
    state: ClearableString,
    city: ClearableString,
    completeAddress: ClearableString,
    postalCode: ClearableString,
    perms,
    status: { type: "string", enum: enums.userStatus },
  },
  errorMessage: {
    required: {
      id: "Manager ID is required",
      email: "Email is required",
      firstName: "First name is required",
      lastName: "Last name is required",
      status: "Status is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      email: "Email must be a valid address",
      id: "Manager ID is required",
      firstName: "First name is required",
      lastName: "Last name is required",
      status: "Status is required",
      phone: "Phone number must be in international format (e.g., +1234567890)",
      age: "Age must be a valid number",
      gender: "Gender is invalid",
    },
  },
};

export const ManagerDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "Manager ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Manager ID is required",
    },
  },
};

export const ManagerList = openSearchListBody();
