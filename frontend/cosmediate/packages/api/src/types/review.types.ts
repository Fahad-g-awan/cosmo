import { Review, ReviewReply } from "@cosmediate/type-utils";

// ============================================
// SHARED TYPES
// ============================================

export type TargetEntityType = "SPECIALIST" | "CLINIC";
export type ReviewAuthorRole = "PATIENT";
export type ReviewReplyAuthorRole = "CLINIC" | "SPECIALIST" | "ADMIN";
export type ReviewStatus = "PUBLISHED" | "HIDDEN" | "FLAGGED";

export type ReviewReplyStatusFilter = "incoming" | "answered" | "all";

export interface ReviewFilters {
  replyCount?: [number, number];
  replyCountMin?: number;
  replyCountMax?: number;
  createdAt?: [string | null, string | null];
  rating?: [number, number];
  ratingMin?: number;
  ratingMax?: number;
  status?: ReviewStatus;
  [key: string]: string | number | boolean | object | undefined;
}

export interface ReviewSearch {
  [key: string]: string | number | boolean | object;
}

export interface ReviewSort {
  by?: string;
  order?: "asc" | "desc";
}

export interface ReviewPagination {
  page?: number;
  nextToken?: string;
  limit?: number;
}

// ============================================
// REVIEW API TYPES
// ============================================

export interface GetReviewRequest {
  id: string;
  targetEntityId?: string;
  targetEntityType?: TargetEntityType;
}

export interface GetReviewsRequest {
  targetEntityId?: string;
  targetEntityType?: TargetEntityType;
  replyCountMin?: number;
  replyCountMax?: number;
  search?: ReviewSearch;
  filters?: ReviewFilters;
  sort?: ReviewSort;
  pagination?: ReviewPagination;
}

export interface CreateReviewRequest {
  targetEntityId: string;
  targetEntity: "ENTITY_TYPE#SPECIALIST" | "ENTITY_TYPE#CLINIC";
  authorId: string;
  authorRole: ReviewAuthorRole;
  comment: string;
  rating: number;
}

export interface UpdateReviewRequest {
  id: string;
  targetEntityId: string;
  targetEntity: "ENTITY_TYPE#SPECIALIST" | "ENTITY_TYPE#CLINIC";
  authorId: string;
  authorRole: ReviewAuthorRole;
  comment: string;
  rating: number;
  status?: ReviewStatus;
}

export interface DeleteReviewRequest {
  id: string;
  targetEntityId: string;
  targetEntity: "ENTITY_TYPE#SPECIALIST" | "ENTITY_TYPE#CLINIC";
  authorId: string;
  authorRole: ReviewAuthorRole;
}

export interface GetReviewResponse {
  success: boolean;
  message: string;
  item: Review | null;
}

export interface GetReviewsResponse {
  success: boolean;
  message: string;
  items: Review[];
  total?: number;
  nextToken?: string;
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  item: Review;
}

export interface UpdateReviewResponse {
  success: boolean;
  message: string;
  item: Review;
}

export interface DeleteReviewResponse {
  success: boolean;
  message: string;
}

// ============================================
// REVIEW REPLY API TYPES
// ============================================

export interface GetReviewReplyRequest {
  id: string;
  reviewId: string;
  targetEntityId: string;
  targetEntityType: TargetEntityType;
}

export interface GetReviewRepliesRequest {
  reviewId: string;
  targetEntityId: string;
  targetEntityType: TargetEntityType;
  search?: ReviewSearch;
  filters?: ReviewFilters;
  sort?: ReviewSort;
  pagination?: ReviewPagination;
}

export interface CreateReviewReplyRequest {
  reviewId: string;
  targetEntityId: string;
  targetEntity: "ENTITY_TYPE#SPECIALIST" | "ENTITY_TYPE#CLINIC";
  authorId: string;
  authorRole: ReviewReplyAuthorRole;
  comment: string;
}

export interface UpdateReviewReplyRequest {
  id: string;
  reviewId: string;
  targetEntityId: string;
  targetEntity: "ENTITY_TYPE#SPECIALIST" | "ENTITY_TYPE#CLINIC";
  authorId: string;
  authorRole: ReviewReplyAuthorRole;
  comment: string;
  status?: ReviewStatus;
}

export interface DeleteReviewReplyRequest {
  id: string;
  // reviewId: string;
  targetEntityId: string;
  targetEntity: "ENTITY_TYPE#SPECIALIST" | "ENTITY_TYPE#CLINIC";
  authorId: string;
  authorRole: ReviewReplyAuthorRole;
}

export interface GetReviewReplyResponse {
  success: boolean;
  message: string;
  item: ReviewReply | null;
}

export interface GetReviewRepliesResponse {
  success: boolean;
  message: string;
  items: ReviewReply[];
  total?: number;
  nextToken?: string;
}

export interface CreateReviewReplyResponse {
  success: boolean;
  message: string;
  item: ReviewReply;
}

export interface UpdateReviewReplyResponse {
  success: boolean;
  message: string;
  item: ReviewReply;
}

export interface DeleteReviewReplyResponse {
  success: boolean;
  message: string;
}
