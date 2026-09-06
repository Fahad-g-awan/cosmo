"use client";

import { DateTime } from "luxon";

import type { Clinic, ReviewReply, Specialist } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";
import {
  CosmediateReviews,
  NoDataFound,
  ReviewRepliesLoader,
  ReviewsLoader,
} from "@cosmediate/ui";
import {
  getReviewsPermissions,
  resolveEntityType,
  useReviewsFormState,
} from "@cosmediate/reviews-core";

import { DialogRenderer } from "@web/context/dialog/DialogRenderer";
import { useReviewsApi } from "@web/hooks/useReviewsApi";

import { useEntityReviewHandlers } from "./hooks/useEntityReviewHandlers";

export interface EntityReviewsPanelProps {
  entity: Clinic | Specialist;
  showMinimal?: boolean;
}

export const EntityReviewsPanel = ({
  entity,
  showMinimal,
}: EntityReviewsPanelProps) => {
  const { sessionUser, userRole } = useAuth();
  const targetEntityType = resolveEntityType(entity);
  const permissions = getReviewsPermissions({ surface: "web", role: userRole });

  const reviewsApi = useReviewsApi({ entity });
  const {
    allReviewReplies,
    allReviews,
    reviewReplies,
    totalReviewsCount,
    reviewApiNextToken,
    reviewReplyApiNextToken,
    isLoading,
    isRepliesLoading,
  } = reviewsApi;

  const form = useReviewsFormState(allReviews, allReviewReplies);
  const {
    toggleReplyForm,
    toggleRepliesVisibility,
    handleEditReview,
    handleEditReply,
    showReplies,
    setEditReviewText,
    setEditReviewRating,
    activeReviewEditId,
    editReviewRating,
    editReviewText,
    setEditReplyText,
    editReplyText,
    activeReplyEditId,
    setReviewText,
    setRating,
    reviewText,
    rating,
    setReplyText,
    replyText,
    activeReplyId,
    expandedReplies,
    isSubmitting,
    showMoreLoading,
  } = form;

  const {
    handleSetReviewsFromApi,
    handleFetchReviewRepliesFromApi,
    handleReviewSubmit,
    handleSaveEditReview,
    handleDeleteReview,
    handleReplySubmit,
    handleSaveReplyEdit,
    handleDeleteReply,
  } = useEntityReviewHandlers({
    entity,
    targetEntityType,
    sessionUser,
    userRole,
    permissions,
    form,
    reviewsApi,
  });

  const showReviewsData = !isLoading && allReviews.length > 0;
  const showNoDataMessage = !isLoading && allReviews.length < 1;

  return (
    <>
      <div className="w-full flex items-center justify-start gap-1 text-xl leading-[24px] text-700 font-bold mb-4">
        <span>Reviews</span>
        <span>({totalReviewsCount})</span>
      </div>

      <CosmediateReviews>
        {!showMinimal && (
          <CosmediateReviews.AddReview
            handleReviewSubmit={handleReviewSubmit}
            reviewText={reviewText}
            setReviewText={setReviewText}
            rating={rating}
            setRating={setRating}
            isSubmitting={isSubmitting?.review || false}
            isRolePatient={userRole === "PATIENT"}
            isValidSession={!!sessionUser}
            canAddReview={permissions.canAddReview && !!sessionUser}
          />
        )}

        {showReviewsData && (
          <CosmediateReviews.ReviewsContainer
            showMoreButton={Boolean(reviewApiNextToken) && !showMinimal}
            showMoreReviews={handleSetReviewsFromApi}
            showMoreLoading={showMoreLoading?.reviews || false}
          >
            {allReviews.map((review, index) => (
              <CosmediateReviews.ReviewsItem
                key={`${review.id}_${index}`}
                index={index}
              >
                <div className="w-[20%] max-sm:w-full flex items-start justify-between">
                  <CosmediateReviews.ReviewUser
                    image="/avatar.jpg"
                    name={review.authorName || ""}
                    date={DateTime.fromISO(review.updatedAt).toFormat(
                      "MMMM dd, yyyy",
                    )}
                    showImage={!showMinimal}
                  />

                  <CosmediateReviews.ReviewsMenu
                    rating={review.rating || ""}
                    isAuthor={sessionUser?.profileId === review.authorId}
                    reviewId={review.id}
                    handleEditReview={handleEditReview}
                    handleDeleteReview={handleDeleteReview}
                    className="sm:hidden"
                    showMenu={!showMinimal}
                  />
                </div>

                <CosmediateReviews.ReviewContent>
                  {review.createdAt !== review.updatedAt && (
                    <CosmediateReviews.EditedText />
                  )}

                  <CosmediateReviews.ReviewComment
                    comment={review.comment || ""}
                  />

                  <CosmediateReviews.UpdateReview
                    reviewId={review.id}
                    activeReviewEditId={activeReviewEditId}
                    editReviewText={editReviewText}
                    setEditReviewText={setEditReviewText}
                    editReviewRating={editReviewRating}
                    setEditReviewRating={setEditReviewRating}
                    handleSaveEditReview={handleSaveEditReview}
                    isSubmitting={
                      isSubmitting?.reviewUpdate?.[review.id] || false
                    }
                  />

                  <CosmediateReviews.ReviewActions
                    reviewId={review.id}
                    repliesCount={review.replyCount || 0}
                    activeReplyId={activeReplyId}
                    activeReviewEditId={activeReviewEditId}
                    expandedReplies={expandedReplies}
                    handleEditReview={handleEditReview}
                    toggleReplyForm={toggleReplyForm}
                    toggleRepliesVisibility={toggleRepliesVisibility}
                    showReplyToggle={review.replyCount > 0 && !showMinimal}
                    showReplies={handleFetchReviewRepliesFromApi}
                    showReplyAction={permissions.canAddReply && !showMinimal}
                  />

                  <CosmediateReviews.ReplyForm
                    reviewId={review.id}
                    activeReplyId={activeReplyId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    isSubmitting={isSubmitting?.reply?.[review.id] || false}
                    handleReplySubmit={handleReplySubmit}
                  />

                  {showReplies(review.id, review.replyCount || 0) && (
                    <CosmediateReviews.RepliesContainer
                      reviewId={review.id}
                      showMoreButton={
                        Boolean(reviewReplyApiNextToken?.[review.id])
                      }
                      showMoreReplies={(reviewId) =>
                        handleFetchReviewRepliesFromApi(reviewId, true)
                      }
                      showMoreLoading={
                        showMoreLoading?.replies?.[review.id] || false
                      }
                    >
                      {(reviewReplies[review.id] ?? []).map(
                        (reply: ReviewReply) => (
                          <CosmediateReviews.ReplyItem
                            key={reply.id}
                            replyId={reply.id}
                          >
                            <CosmediateReviews.UserImage
                              image={reply.authorImage || "/avatar.jpg"}
                              name={reply.authorName || "Author name"}
                            />

                            <CosmediateReviews.ReplyGroup>
                              <CosmediateReviews.ReplyUser
                                name={reply.authorName || ""}
                                date={DateTime.fromISO(
                                  reply.updatedAt,
                                ).toFormat("MMMM dd, yyyy")}
                              />

                              {reply.createdAt !== reply.updatedAt && (
                                <CosmediateReviews.EditedText />
                              )}

                              <CosmediateReviews.ReviewComment
                                comment={reply.comment || ""}
                              />

                              <CosmediateReviews.ReplyActions
                                activeReplyEditId={activeReplyEditId}
                                isAuthor={
                                  sessionUser?.profileId === reply.authorId
                                }
                                replyId={reply.id}
                                handleEditReply={handleEditReply}
                                handleDeleteReply={handleDeleteReply}
                              />

                              <CosmediateReviews.UpdateReply
                                activeReplyEditId={activeReplyEditId}
                                editReplyText={editReplyText}
                                setEditReplyText={setEditReplyText}
                                replyId={reply.id}
                                handleSaveReplyEdit={(replyId) =>
                                  handleSaveReplyEdit(replyId, review.id)
                                }
                                isSubmitting={
                                  isSubmitting?.replyUpdate?.[reply.id] || false
                                }
                              />
                            </CosmediateReviews.ReplyGroup>
                          </CosmediateReviews.ReplyItem>
                        ),
                      )}

                      {isRepliesLoading?.[review.id] &&
                        (reviewReplies[review.id] ?? []).length < 1 && (
                          <ReviewRepliesLoader />
                        )}
                    </CosmediateReviews.RepliesContainer>
                  )}
                </CosmediateReviews.ReviewContent>

                <CosmediateReviews.ReviewsMenu
                  rating={review.rating || ""}
                  isAuthor={sessionUser?.profileId === review.authorId}
                  reviewId={review.id}
                  handleEditReview={handleEditReview}
                  handleDeleteReview={handleDeleteReview}
                  className="max-sm:hidden"
                  showMenu={!showMinimal}
                />
              </CosmediateReviews.ReviewsItem>
            ))}
          </CosmediateReviews.ReviewsContainer>
        )}
      </CosmediateReviews>

      {showNoDataMessage && (
        <NoDataFound
          message="No reviews found"
          description="Please share your experience and opinions."
        />
      )}

      {isLoading && (
        <div className="mt-5 w-full">
          <ReviewsLoader />
        </div>
      )}

      <DialogRenderer />
    </>
  );
};
