import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import {
  ReviewCreate,
  ReviewUpdate,
  ReviewDelete,
  ReviewList,
} from "../schemas/review/review.mjs";
import {
  ReviewReplyCreate,
  ReviewReplyUpdate,
  ReviewReplyDelete,
  ReviewReplyList,
} from "../schemas/review/reviewReply.mjs";

export const REVIEW_SCHEMAS = {
  [CRUD_ACTIONS.REVIEW.CREATE]: ReviewCreate,
  [CRUD_ACTIONS.REVIEW.UPDATE]: ReviewUpdate,
  [CRUD_ACTIONS.REVIEW.DELETE]: ReviewDelete,
  [CRUD_ACTIONS.REVIEW.LIST]: ReviewList,

  [CRUD_ACTIONS.REVIEW_REPLY.CREATE]: ReviewReplyCreate,
  [CRUD_ACTIONS.REVIEW_REPLY.UPDATE]: ReviewReplyUpdate,
  [CRUD_ACTIONS.REVIEW_REPLY.DELETE]: ReviewReplyDelete,
  [CRUD_ACTIONS.REVIEW_REPLY.LIST]: ReviewReplyList,
};
