import { Boolean, String, URI } from "../../shared/primitives.schema.mjs";
import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import { faqs, htmlBlob, tags } from "../../shared/fragments.schema.mjs";

const overview = {
  type: "string",
  minLength: 10,
  maxLength: 300,
  pattern: "\\S",
  errorMessage: {
    minLength: "Overview must be at least 10 characters",
    maxLength: "Overview must be at most 300 characters",
    pattern: "Overview is required",
  },
};

const requiredTags = {
  ...tags,
  minItems: 1,
  errorMessage: {
    minItems: "At least one tag is required",
  },
};

const requiredFaqs = {
  ...faqs,
  minItems: 1,
  errorMessage: {
    minItems: "At least one FAQ is required",
  },
};

const treatmentName = {
  type: "string",
  minLength: 2,
  maxLength: 100,
  pattern: "\\S",
  errorMessage: {
    minLength: "Name must be at least 2 characters",
    maxLength: "Name must be at most 100 characters",
    pattern: "Name is required",
  },
};

export const TreatmentCreate = {
  type: "object",
  additionalProperties: false,
  required: [
    "categoryId",
    "name",
    "published",
    "overview",
    "recoveryTime",
    "anesthesia",
    "htmlDescription",
    "tags",
    "faqs",
    "treatmentImage",
  ],
  properties: {
    categoryId: String,
    treatmentImage: URI,
    name: treatmentName,
    htmlDescription: htmlBlob,
    overview,
    recoveryTime: String,
    anesthesia: String,
    faqs: requiredFaqs,
    tags: requiredTags,
    published: Boolean,
  },
  errorMessage: {
    required: {
      categoryId: "Category ID is required",
      name: "Name is required",
      published: "Please provide treatment published status",
      overview: "Overview is required",
      recoveryTime: "Recovery time is required",
      anesthesia: "Anesthesia requirement is required",
      htmlDescription: "Content is required",
      tags: "At least one tag is required",
      faqs: "At least one FAQ is required",
      treatmentImage: "Treatment image is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      categoryId: "Category ID is required",
      name: "Name is required",
      published: "Please provide treatment published status",
      overview: "Overview is invalid",
      recoveryTime: "Recovery time is required",
      anesthesia: "Anesthesia requirement is required",
      htmlDescription: "Content is required",
      tags: "At least one tag is required",
      faqs: "At least one FAQ is required",
      treatmentImage: "Treatment image is required",
    },
  },
};

export const TreatmentUpdate = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "categoryId",
    "name",
    "published",
    "overview",
    "recoveryTime",
    "anesthesia",
    "htmlDescription",
    "tags",
    "faqs",
    "treatmentImage",
  ],
  properties: {
    id: String,
    categoryId: String,
    name: treatmentName,
    htmlDescription: htmlBlob,
    overview,
    recoveryTime: String,
    anesthesia: String,
    faqs: requiredFaqs,
    tags: requiredTags,
    treatmentImage: URI,
    published: Boolean,
  },
  errorMessage: {
    required: {
      id: "Treatment ID is required",
      categoryId: "Category ID is required",
      name: "Name is required",
      published: "Please provide treatment published status",
      overview: "Overview is required",
      recoveryTime: "Recovery time is required",
      anesthesia: "Anesthesia requirement is required",
      htmlDescription: "Content is required",
      tags: "At least one tag is required",
      faqs: "At least one FAQ is required",
      treatmentImage: "Treatment image is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Treatment ID is required",
      categoryId: "Category ID is required",
      name: "Name is required",
      published: "Please provide treatment published status",
      overview: "Overview is invalid",
      recoveryTime: "Recovery time is required",
      anesthesia: "Anesthesia requirement is required",
      htmlDescription: "Content is required",
      tags: "At least one tag is required",
      faqs: "At least one FAQ is required",
      treatmentImage: "Treatment image is required",
    },
  },
};

export const TreatmentDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "Treatment ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Treatment ID is required",
    },
  },
};

export const TreatmentList = openSearchListBody();
