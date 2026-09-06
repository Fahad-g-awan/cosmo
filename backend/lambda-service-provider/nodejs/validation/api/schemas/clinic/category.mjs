import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import { String } from "../../shared/primitives.schema.mjs";

/** Clinic category display name — longer than generic String minLength:1. */
const CategoryName = {
  type: "string",
  minLength: 2,
  maxLength: 500,
  pattern: "\\S",
  errorMessage: {
    minLength: "Category name must be at least 2 characters",
    maxLength: "Category name must be at most 500 characters",
    pattern: "Category name cannot be empty or whitespace only",
  },
};

export const ClinicCategoryCreate = {
  type: "object",
  additionalProperties: false,
  required: ["categories", "published"],
  properties: {
    categories: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: CategoryName,
    },
    published: { type: "boolean" },
  },
  errorMessage: {
    required: {
      categories: "Categories are required",
      published: "Published status is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      categories: "Categories are required",
      published: "Published status is required",
    },
  },
};

export const ClinicCategoryUpdate = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "published"],
  properties: {
    id: String,
    name: CategoryName,
    published: { type: "boolean" },
  },
  errorMessage: {
    required: {
      id: "ID is required",
      name: "Name is required",
      published: "Published status is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "ID is required",
      name: "Name is required",
      published: "Published status is required",
    },
  },
};

export const ClinicCategoryDelete = {
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

export const ClinicCategoryList = openSearchListBody();
