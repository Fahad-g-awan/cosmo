import { email } from "../shared/fragments.schema.mjs";
import { String } from "../shared/primitives.schema.mjs";

export const LambdaTestValidate = {
  type: "object",
  additionalProperties: false,
  required: ["email"],
  properties: {
    email,
    note: String,
  },
  errorMessage: {
    required: {
      email: "Email is required",
    },
    additionalProperties: "Unknown field supplied",
    properties: {
      email: "Email must be a valid address",
    },
  },
};

export const LambdaTestRouteAccess = {
  type: "object",
  additionalProperties: false,
  required: ["routeKey", "perms"],
  properties: {
    routeKey: { type: "string", minLength: 1 },
    perms: {
      type: "array",
      items: { type: "string", minLength: 1 },
      minItems: 0,
    },
  },
  errorMessage: {
    required: {
      routeKey: "routeKey is required",
      perms: "perms array is required",
    },
    additionalProperties: "Unknown field supplied",
  },
};

export const LambdaTestGrants = {
  type: "object",
  additionalProperties: false,
  required: ["granterRole", "targetRole", "requestedGrants"],
  properties: {
    granterRole: String,
    targetRole: String,
    granterGrants: {
      type: "array",
      items: { type: "string", minLength: 1 },
    },
    targetCurrentGrants: {
      type: "array",
      items: { type: "string", minLength: 1 },
    },
    requestedGrants: {
      type: "array",
      items: { type: "string", minLength: 1 },
      minItems: 1,
    },
  },
  errorMessage: {
    required: {
      granterRole: "granterRole is required",
      targetRole: "targetRole is required",
      requestedGrants: "requestedGrants is required",
    },
    additionalProperties: "Unknown field supplied",
  },
};
