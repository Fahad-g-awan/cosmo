import { EntityMetadata } from "./shared";

export interface ReviewReply extends EntityMetadata {
  reviewId: string;

  targetEntityType: string;
  targetEntityId: string;
  targetName: string;
  targetEmail: string;
  targetImage: string;
  targetCompleteAddress: string;

  authorId: string;
  authorRole: string;
  authorName: string;
  authorEmail: string;
  authorImage: string;
  authorCompleteAddress: string;

  comment: string;
  entityType: string;
}

export interface Review extends EntityMetadata {
  targetEntityType: string;
  targetEntityId: string;
  targetName: string;
  targetEmail: string;
  targetImage: string;
  targetCompleteAddress: string;

  authorId: string;
  authorRole: string;
  authorName: string;
  authorEmail: string;
  authorImage: string;
  authorCompleteAddress: string;

  comment: string;
  rating: string;

  entityType: string;

  replyCount: number;
}
