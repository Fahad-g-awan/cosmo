import { USER_ROLES } from "../../../../constants/auth/roles.constants.mjs";
import { ENTITY_TYPE } from "../../../../constants/db/entity-types.mjs";
import { String } from "../../shared/primitives.schema.mjs";
import { enums } from "../../shared/enums.schema.mjs";
import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";

const reviewTargetEntityEnum = [
  ENTITY_TYPE.CLINIC,
  ENTITY_TYPE.SPECIALIST,
  "CLINIC",
  "SPECIALIST",
];

const replyAuthorRoles = [
  USER_ROLES.CLINIC,
  USER_ROLES.SPECIALIST,
  USER_ROLES.ADMIN,
];

export const ReviewReplyCreate = {
  type: "object",
  additionalProperties: false,
  required: [
    "reviewId",
    "authorId",
    "authorRole",
    "targetEntity",
    "targetEntityId",
    "comment",
  ],
  properties: {
    reviewId: String,
    authorId: String,
    authorRole: {
      type: "string",
      enum: replyAuthorRoles,
    },
    targetEntity: {
      type: "string",
      enum: reviewTargetEntityEnum,
    },
    targetEntityId: String,
    comment: String,
  },
  errorMessage: {
    additionalProperties: "Unknown field supplied in request body",
    required: {
      reviewId: "Review ID is required",
      authorId: "Author ID is required",
      authorRole: "Author role is required",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
      comment: "Comment is required",
    },
    properties: {
      reviewId: "Review ID is required",
      authorId: "Author ID is required",
      authorRole:
        "Author role must be one of: ADMIN, CLINIC, SPECIALIST",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
      comment: "Comment is required",
    },
  },
};

export const ReviewReplyUpdate = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "reviewId",
    "authorId",
    "authorRole",
    "targetEntity",
    "targetEntityId",
    "comment",
  ],
  properties: {
    id: String,
    reviewId: String,
    authorId: String,
    authorRole: {
      type: "string",
      enum: replyAuthorRoles,
    },
    targetEntity: {
      type: "string",
      enum: reviewTargetEntityEnum,
    },
    targetEntityId: String,
    comment: String,
    status: {
      type: "string",
      enum: enums.reviewStatus,
    },
  },
  errorMessage: {
    additionalProperties: "Unknown field supplied in request body",
    required: {
      id: "Reply ID is required",
      reviewId: "Review ID is required",
      authorId: "Author ID is required",
      authorRole: "Author role is required",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
      comment: "Comment is required",
    },
    properties: {
      id: "Reply ID is required",
      reviewId: "Review ID is required",
      authorId: "Author ID is required",
      authorRole:
        "Author role must be one of: ADMIN, CLINIC, SPECIALIST",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
      comment: "Comment is required",
    },
  },
};

export const ReviewReplyDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id", "authorId", "authorRole", "targetEntity", "targetEntityId"],
  properties: {
    id: String,
    authorId: String,
    authorRole: {
      type: "string",
      enum: replyAuthorRoles,
    },
    targetEntity: {
      type: "string",
      enum: reviewTargetEntityEnum,
    },
    targetEntityId: String,
  },
  errorMessage: {
    additionalProperties: "Unknown field supplied in request body",
    required: {
      id: "Reply ID is required",
      authorId: "Author ID is required",
      authorRole: "Author role is required",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
    },
    properties: {
      id: "Reply ID is required",
      authorId: "Author ID is required",
      authorRole: "Author role is required",
      targetEntity: "Target entity is required",
      targetEntityId: "Target entity ID is required",
    },
  },
};

const reviewReplyListBase = openSearchListBody();

export const ReviewReplyList = {
  type: "object",
  additionalProperties: false,
  required: ["reviewId"],
  properties: {
    ...reviewReplyListBase.properties,
    reviewId: String,
    targetEntityId: String,
    targetEntityType: {
      type: "string",
      enum: reviewTargetEntityEnum,
    },
    authorId: String,
  },
  errorMessage: {
    additionalProperties: "Unknown field supplied in request body",
    required: {
      reviewId: "Review ID is required",
    },
    properties: {
      reviewId: "Review ID is required",
    },
  },
};
