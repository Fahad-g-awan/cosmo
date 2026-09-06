import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import { String } from "../../shared/primitives.schema.mjs";

/** Blog category display name — min 2, no whitespace-only. */
const CategoryName = {
  type: "string",
  minLength: 2,
  maxLength: 100,
  pattern: "\\S",
  errorMessage: {
    minLength: "Category name must be at least 2 characters",
    maxLength: "Category name must be at most 100 characters",
    pattern: "Category name cannot be empty or whitespace only",
  },
};

export const BlogCategoryCreate = {
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
      published: "Published is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      categories: "Categories must be an array of valid names",
      published: "Published must be a boolean",
    },
  },
};

export const BlogCategoryUpdate = {
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
      id: "Category ID is required",
      name: "Name is required",
      published: "Published is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Category ID must be a valid string",
      name: "Name is required",
      published: "Published must be a boolean",
    },
  },
};

export const BlogCategoryDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "Category ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Category ID must be a valid string",
    },
  },
};

export const BlogCategoryList = openSearchListBody();
