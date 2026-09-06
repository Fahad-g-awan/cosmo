import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import { String } from "../../shared/primitives.schema.mjs";

/** Treatment category display name — aligned with clinic CategoryName. */
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

export const TreatmentCategoryCreate = {
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
      published: "Please provide publish status",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      categories: "Categories are required",
      published: "Please provide publish status",
    },
  },
};

export const TreatmentCategoryUpdate = {
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

export const TreatmentCategoryDelete = {
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

export const TreatmentCategoryList = openSearchListBody();
