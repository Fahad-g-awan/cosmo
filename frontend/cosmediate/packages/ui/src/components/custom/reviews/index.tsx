"use client";

import { CosmediateReviews as CosmediateReviewsRoot } from "./CosmediateReviews";
import { RepliesContainer } from "./RepliesContainer";
import { ReviewsContainer } from "./ReviewsContainer";
import { ShowMoreLoader } from "./ShowMoreLoader";
import { ReviewComment } from "./ReviewComment";
import { ReviewContent } from "./ReviewContent";
import { ReviewActions } from "./ReviewActions";
import { ReplyActions } from "./ReplyActions";
import { UpdateReview } from "./UpdateReview";
import { ReviewsItem } from "./ReviewsItem";
import { ReviewsMenu } from "./ReviewsMenu";
import { UpdateReply } from "./UpdateReply";
import { ReplyGroup } from "./ReplyGroup";
import { EditedText } from "./EditedText";
import { ReviewUser } from "./ReviewUser";
import { ReplyForm } from "./ReplyForm";
import { AddReview } from "./AddReview";
import { ReplyItem } from "./ReplyItem";
import { ReplyUser } from "./ReplyUser";
import { UserImage } from "./UserImage";

export const CosmediateReviews =
  CosmediateReviewsRoot as typeof CosmediateReviewsRoot & {
    ReviewsContainer: typeof ReviewsContainer;
    ReviewsItem: typeof ReviewsItem;
    AddReview: typeof AddReview;
    UserImage: typeof UserImage;
    ReviewUser: typeof ReviewUser;
    ReviewContent: typeof ReviewContent;
    EditedText: typeof EditedText;
    ReviewComment: typeof ReviewComment;
    UpdateReview: typeof UpdateReview;
    ReviewActions: typeof ReviewActions;
    ReplyGroup: typeof ReplyGroup;
    ReplyForm: typeof ReplyForm;
    ReplyUser: typeof ReplyUser;
    ReplyActions: typeof ReplyActions;
    UpdateReply: typeof UpdateReply;
    RepliesContainer: typeof RepliesContainer;
    ReplyItem: typeof ReplyItem;
    ReviewsMenu: typeof ReviewsMenu;
    ShowMoreLoader: typeof ShowMoreLoader;
  };

CosmediateReviews.ReviewsContainer = ReviewsContainer;
CosmediateReviews.ReviewsItem = ReviewsItem;
CosmediateReviews.AddReview = AddReview;
CosmediateReviews.UserImage = UserImage;
CosmediateReviews.ReviewUser = ReviewUser;
CosmediateReviews.ReviewContent = ReviewContent;
CosmediateReviews.EditedText = EditedText;
CosmediateReviews.ReviewComment = ReviewComment;
CosmediateReviews.UpdateReview = UpdateReview;
CosmediateReviews.ReviewActions = ReviewActions;
CosmediateReviews.ReplyGroup = ReplyGroup;
CosmediateReviews.ReplyForm = ReplyForm;
CosmediateReviews.ReplyUser = ReplyUser;
CosmediateReviews.ReplyActions = ReplyActions;
CosmediateReviews.UpdateReply = UpdateReply;
CosmediateReviews.RepliesContainer = RepliesContainer;
CosmediateReviews.ReplyItem = ReplyItem;
CosmediateReviews.ReviewsMenu = ReviewsMenu;
CosmediateReviews.ShowMoreLoader = ShowMoreLoader;

export type { NodeProps } from "./types";
