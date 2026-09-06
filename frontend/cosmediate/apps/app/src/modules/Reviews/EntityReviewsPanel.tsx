"use client";

import { useMemo } from "react";
import { DateTime } from "luxon";
import Link from "next/link";

import type { Clinic, ReviewReply, Specialist } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";
import {
  CosmediateReviews,
  NoDataFound,
  ReviewRepliesLoader,
  ReviewsLoader,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import {
  buildReplyStatusFilters,
  getReviewsPermissions,
  resolveEntityType,
  useReviewsFormState,
  type ReviewsListQuery,
  type ReviewsSurface,
} from "@cosmediate/reviews-core";

import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { useReviewsApi } from "@app/hooks/useReviewsApi";

import { useEntityReviewHandlers } from "./hooks/useEntityReviewHandlers";

export interface EntityReviewsPanelProps {
  entity: Clinic | Specialist;
  variant?: "default" | "analytics-preview";
  browseListQuery?: ReviewsListQuery;
}

export const EntityReviewsPanel = ({
  entity,
  variant = "default",
  browseListQuery,
}: EntityReviewsPanelProps) => {
  const isAnalyticsPreview = variant === "analytics-preview";

  const { sessionUser, userRole } = useAuth();
  const targetEntityType = resolveEntityType(entity);
  const surface: ReviewsSurface = isAnalyticsPreview
    ? "analytics-preview"
    : "dashboard";
  const permissions = getReviewsPermissions({ surface, role: userRole });

  const listQuery = useMemo((): ReviewsListQuery => {
    if (browseListQuery) {
      return browseListQuery;
    }

    return {
      sort: { by: "createdAt", order: "desc" },
      pagination: { limit: isAnalyticsPreview ? 5 : 10 },
      filters: buildReplyStatusFilters("incoming"),
    };
  }, [browseListQuery, isAnalyticsPreview]);

  const reviewsApi = useReviewsApi({ entity, listQuery });
  const {
    allReviewReplies,
    allReviews,
    reviewReplies,
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

  const newReviewsCount = useMemo(() => {
    const today = DateTime.now();

    return allReviews.filter((review) => {
      if (!review.createdAt) return false;
      return DateTime.fromISO(review.createdAt).hasSame(today, "day");
    }).length;
  }, [allReviews]);

  const showReviewsData = !isLoading && allReviews.length > 0;
  const showNoDataMessage = !isLoading && allReviews.length < 1;

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-start",
        isAnalyticsPreview ? "gap-5" : "gap-10",
      )}
    >
      {isAnalyticsPreview && (
        <div className="w-full flex items-center justify-between border-b-2px border-stroke pb-3">
          <div className="text-start text-[18px] font-bold leading-[22px] text-700">
            Reviews {newReviewsCount > 0 && `(+${newReviewsCount})`}
          </div>

          <Link
            href="/reviews"
            className="font-semibold text-sm text-primary-accent/80 hover:text-primary-accent hover:underline underline-offset-4"
          >
            Show All
          </Link>
        </div>
      )}

      {showReviewsData && (
        <CosmediateReviews>
          <CosmediateReviews.ReviewsContainer
            showMoreButton={Boolean(reviewApiNextToken)}
            showMoreReviews={handleSetReviewsFromApi}
            showMoreLoading={showMoreLoading?.reviews || false}
          >
            {allReviews.map((review, index) => (
              <CosmediateReviews.ReviewsItem
                key={`${review.id}_${index}`}
                index={index}
                innerClassName="gap-5"
              >
                <div className="w-[20%] max-sm:w-full flex items-start justify-between">
                  <CosmediateReviews.ReviewUser
                    image="/avatar.jpg"
                    name={review.authorName || ""}
                    date={DateTime.fromISO(review.updatedAt).toFormat(
                      "MMMM dd, yyyy",
                    )}
                    showImage={false}
                  />

                  <CosmediateReviews.ReviewsMenu
                    rating={review.rating || ""}
                    isAuthor={sessionUser?.profileId === review.authorId}
                    reviewId={review.id}
                    handleEditReview={handleEditReview}
                    handleDeleteReview={() => {}}
                    showMenu={false}
                  />
                </div>

                <CosmediateReviews.ReviewContent className="w-[80%]">
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
                    handleSaveEditReview={() => {}}
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
                    showReplyToggle={review.replyCount > 0}
                    showReplies={handleFetchReviewRepliesFromApi}
                    showReplyAction={
                      permissions.canAddReply && !isAnalyticsPreview
                    }
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
                      showMoreButton={Boolean(
                        reviewReplyApiNextToken?.[review.id],
                      )}
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
              </CosmediateReviews.ReviewsItem>
            ))}
          </CosmediateReviews.ReviewsContainer>
        </CosmediateReviews>
      )}

      {showNoDataMessage && (
        <NoDataFound
          message="No reviews data found"
          description="If you think this is a mistake, please contact administeration."
        />
      )}

      {isLoading && (
        <div className="mt-5 w-full">
          <ReviewsLoader />
        </div>
      )}

      <DialogRenderer />
    </div>
  );
};

export default EntityReviewsPanel;
