import {
  email,
  phone,
  clearablePhone,
  permsAdminGrantable,
} from "../shared/fragments.schema.mjs";
import { USER_STATUS_REGISTRY } from "../../../constants/auth/status.constants.mjs";
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

export const AdminCreate = {
  type: "object",
  additionalProperties: false,
  required: ["email", "firstName", "lastName"],
  properties: {
    email,
    adminImage: URI,
    firstName: String,
    lastName: String,
    phone,
    age: Integer,
    gender: Gender,
    country: String,
    state: String,
    city: String,
    completeAddress: String,
    postalCode: String,
    perms: permsAdminGrantable,
    status: { type: "string", enum: USER_STATUS_REGISTRY },
  },
  errorMessage: {
    required: {
      email: "Email is required",
      firstName: "First name is required",
      lastName: "Last name is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      email: "Email must be a valid address",
      firstName: "First name is required",
      lastName: "Last name is required",
    },
  },
};

export const AdminUpdate = {
  type: "object",
  additionalProperties: false,
  required: ["email", "id", "status"],
  properties: {
    id: String,
    email,
    adminImage: ClearableURI,
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
    perms: permsAdminGrantable,
    status: { type: "string", enum: USER_STATUS_REGISTRY },
  },
  errorMessage: {
    required: {
      email: "Email is required",
      id: "Admin ID is required",
      status: "Status is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      email: "Email must be a valid address",
      id: "Admin ID is required",
      status: "Status is required",
      firstName: "First name is invalid",
      lastName: "Last name is invalid",
      phone: "Phone number must be in international format (e.g., +1234567890)",
      age: "Age must be a valid number",
      gender: "Gender is invalid",
    },
  },
};

export const AdminBootstrap = AdminCreate;

export const AdminList = openSearchListBody();

export const AdminDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "Admin ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Admin ID is required",
    },
  },
};
