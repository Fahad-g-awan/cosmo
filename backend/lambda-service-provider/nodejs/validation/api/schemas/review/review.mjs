import { USER_ROLES } from "../../../../constants/auth/roles.constants.mjs";
import { ENTITY_TYPE } from "../../../../constants/db/entity-types.mjs";
import { Float, String } from "../../shared/primitives.schema.mjs";
import { enums } from "../../shared/enums.schema.mjs";
import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";

const reviewTargetEntityEnum = [
  ENTITY_TYPE.CLINIC,
  ENTITY_TYPE.SPECIALIST,
  "CLINIC",
  "SPECIALIST",
];

export const ReviewCreate = {
  type: "object",
  additionalProperties: false,
  required: [
    "authorId",
    "authorRole",
    "targetEntity",
    "targetEntityId",
    "comment",
    "rating",
  ],
  properties: {
    authorId: String,
    authorRole: { type: "string", enum: [USER_ROLES.PATIENT] },
    targetEntity: {
      type: "string",
      enum: reviewTargetEntityEnum,
    },
    targetEntityId: String,
    comment: String,
    rating: Float,
  },
  errorMessage: {
    required: {
      authorId: "Author ID is required",
      authorRole: "Author role is required",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
      comment: "Comment is required",
      rating: "Rating is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      authorId: "Author ID is required",
      authorRole: "Author role must be PATIENT",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
      comment: "Comment is required",
      rating: "Rating is required",
    },
  },
};

export const ReviewUpdate = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "authorId",
    "authorRole",
    "targetEntity",
    "targetEntityId",
    "comment",
    "rating",
  ],
  properties: {
    id: String,
    authorId: String,
    authorRole: { type: "string", enum: [USER_ROLES.PATIENT] },
    targetEntity: {
      type: "string",
      enum: reviewTargetEntityEnum,
    },
    targetEntityId: String,
    comment: String,
    rating: Float,
    status: {
      type: "string",
      enum: enums.reviewStatus,
    },
  },
  errorMessage: {
    additionalProperties: "Unknown field supplied in request body",
    required: {
      id: "Review ID is required",
      authorId: "Author ID is required",
      authorRole: "Author role is required",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
      comment: "Comment is required",
      rating: "Rating is required",
    },
    properties: {
      id: "Review ID is required",
      authorId: "Author ID is required",
      authorRole: "Author role must be PATIENT",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
      comment: "Comment is required",
      rating: "Rating is required",
    },
  },
};

export const ReviewDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id", "authorId", "authorRole", "targetEntity", "targetEntityId"],
  properties: {
    id: String,
    authorId: String,
    authorRole: { type: "string", enum: [USER_ROLES.PATIENT] },
    targetEntity: {
      type: "string",
      enum: reviewTargetEntityEnum,
    },
    targetEntityId: String,
  },
  errorMessage: {
    additionalProperties: "Unknown field supplied in request body",
    required: {
      id: "Review ID is required",
      authorId: "Author ID is required",
      authorRole: "Author role is required",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
    },
    properties: {
      id: "Review ID is required",
      authorId: "Author ID is required",
      authorRole: "Author role must be PATIENT",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
    },
  },
};

const reviewListBase = openSearchListBody();

export const ReviewList = {
  type: "object",
  additionalProperties: false,
  properties: {
    ...reviewListBase.properties,
    targetEntityId: String,
    targetEntityType: {
      type: "string",
      enum: reviewTargetEntityEnum,
    },
    authorId: String,
    reviewId: String,
    ratingMin: { type: "number" },
    ratingMax: { type: "number" },
  },
};
