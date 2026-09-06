import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import { String } from "../../shared/primitives.schema.mjs";

/** Treatment brand display name — aligned with clinic CategoryName rules. */
const BrandName = {
  type: "string",
  minLength: 2,
  maxLength: 500,
  pattern: "\\S",
  errorMessage: {
    minLength: "Brand name must be at least 2 characters",
    maxLength: "Brand name must be at most 500 characters",
    pattern: "Brand name cannot be empty or whitespace only",
  },
};

export const TreatmentBrandsCreate = {
  type: "object",
  additionalProperties: false,
  required: ["brands", "published"],
  properties: {
    brands: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: BrandName,
    },
    published: { type: "boolean" },
  },
  errorMessage: {
    required: {
      brands: "Brands are required",
      published: "Please provide publish status",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      brands: "Brands are required",
      published: "Please provide publish status",
    },
  },
};

export const TreatmentBrandsUpdate = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "published"],
  properties: {
    id: String,
    name: BrandName,
    published: { type: "boolean" },
  },
  errorMessage: {
    required: {
      id: "ID is required",
      name: "Name is required",
      published: "Please provide publish status",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "ID is required",
      name: "Name is required",
      published: "Please provide publish status",
    },
  },
};

export const TreatmentBrandsDelete = {
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

export const TreatmentBrandsList = openSearchListBody();
