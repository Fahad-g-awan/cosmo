import { String } from "../shared/primitives.schema.mjs";

export const oAuthClientAppCreate = {
  type: "object",
  additionalProperties: false,
  required: ["name", "description", "status", "redirectURIs"],
  properties: {
    name: String,
    description: String,
    status: String,
    redirectURIs: {
      type: "array",
      items: String,
    },
  },
  errorMessage: {
    required: {
      name: "Name is required",
      description: "Description is required",
      status: "Status is required",
      redirectURIs: "Redirect URIs is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      name: "Name is required",
      description: "Description is required",
      status: "Status is required",
      redirectURIs: "Redirect URIs is required",
    },
  },
};

export const oAuthClientAppUpdate = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "description", "status", "redirectURIs"],
  properties: {
    id: String,
    name: String,
    description: String,
    status: String,
    redirectURIs: {
      type: "array",
      items: String,
    },
  },
  errorMessage: {
    required: {
      id: "ID is required",
      name: "Name is required",
      description: "Description is required",
      status: "Status is required",
      redirectURIs: "Redirect URIs is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "ID is required",
      name: "Name is required",
      description: "Description is required",
      status: "Status is required",
      redirectURIs: "Redirect URIs is required",
    },
  },
};

export const oAuthClientAppDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "ID is required",
    },
  },
};
