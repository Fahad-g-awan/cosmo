import { useCallback, useEffect, useRef, useState } from "react";

import {
  createReviewApi,
  createReviewReplyApi,
  deleteReviewApi,
  deleteReviewReplyApi,
  listReviewReplies,
  listReviews,
  updateReviewApi,
  updateReviewReplyApi,
  type CreateReviewReplyRequest,
  type CreateReviewRequest,
  type DeleteReviewReplyRequest,
  type DeleteReviewRequest,
  type GetReviewRepliesRequest,
  type GetReviewsRequest,
  type UpdateReviewReplyRequest,
  type UpdateReviewRequest,
} from "@cosmediate/api";
import { subscribeReviewEvents } from "@cosmediate/socket-setup";
import type { Review, ReviewReply } from "@cosmediate/type-utils";

import { mergeReviewReplies } from "../lib/mergeReviewReplies";
import { mergeReviews } from "../lib/mergeReviews";
import type { ReviewFilters } from "@cosmediate/api";
import type { ReviewsListQuery, UseReviewsDataOptions } from "../types";

export const useReviewsData = ({
  targetEntityId,
  targetEntityType,
  scope,
  accessToken,
  refetchKey,
  listQuery,
  enabled = true,
}: UseReviewsDataOptions) => {
  const [allReviewReplies, setAllReviewReplies] = useState<ReviewReply[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewReplies, setReviewReplies] = useState<
    Record<string, ReviewReply[]>
  >({});
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [isRepliesLoading, setIsRepliesLoading] = useState<
    Record<string, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const [reviewApiNextToken, setReviewApiNextToken] = useState<
    string | undefined
  >();
  const [reviewReplyApiNextToken, setReviewReplyApiNextToken] = useState<
    Record<string, string | undefined>
  >({});

  const optimisticReviewIds = useRef(new Set<string>());
  const optimisticReplyIds = useRef(new Set<string>());
  const listQueryRef = useRef(listQuery);
  listQueryRef.current = listQuery;

  const listQueryKey = JSON.stringify(listQuery ?? {});

  const resetReviewPagination = useCallback(() => {
    setReviewApiNextToken(undefined);
    setAllReviews([]);
    setTotalReviewsCount(0);
  }, []);

  const applyReviewSocket = useCallback(
    (action: "ADD" | "UPDATE" | "DELETE", reviewData: Review) => {
      switch (action) {
        case "ADD":
          if (
            !optimisticReviewIds.current.has(reviewData.id) &&
            !allReviews.some((r) => r.id === reviewData.id)
          ) {
            setTotalReviewsCount((c) => c + 1);
          }
          setAllReviews((prev) =>
            mergeReviews({
              existing: prev,
              loaded: [],
              socketEvents: [reviewData],
            }),
          );
          break;
        case "UPDATE":
          setAllReviews((prev) =>
            mergeReviews({
              existing: prev,
              loaded: [],
              socketEvents: [reviewData],
            }),
          );
          break;
        case "DELETE":
          if (allReviews.some((r) => r.id === reviewData.id)) {
            setTotalReviewsCount((c) => Math.max(c - 1, 0));
          }
          setAllReviews((prev) => prev.filter((r) => r.id !== reviewData.id));
          break;
      }
    },
    [allReviews],
  );

  const applyReplySocket = useCallback(
    (action: "ADD" | "UPDATE" | "DELETE", replyData: ReviewReply) => {
      const reviewId = replyData.reviewId;

      setAllReviewReplies((prev) => {
        switch (action) {
          case "ADD":
          case "UPDATE":
            return mergeReviewReplies({
              existing: prev,
              loaded: [],
              socketEvents: [replyData],
            });
          case "DELETE":
            return prev.filter((r) => r.id !== replyData.id);
          default:
            return prev;
        }
      });

      setReviewReplies((prev) => {
        const current = prev[reviewId] || [];
        switch (action) {
          case "ADD":
          case "UPDATE":
            return {
              ...prev,
              [reviewId]: mergeReviewReplies({
                existing: current,
                loaded: [],
                socketEvents: [replyData],
              }),
            };
          case "DELETE":
            return {
              ...prev,
              [reviewId]: current.filter((r) => r.id !== replyData.id),
            };
          default:
            return prev;
        }
      });

      if (action === "ADD") {
        if (
          !optimisticReplyIds.current.has(replyData.id) &&
          !allReviewReplies.some((r) => r.id === replyData.id)
        ) {
          setAllReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? { ...r, replyCount: (r.replyCount ?? 0) + 1 }
                : r,
            ),
          );
        }
      }

      if (action === "DELETE") {
        if (allReviewReplies.some((r) => r.id === replyData.id)) {
          setAllReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? { ...r, replyCount: Math.max((r.replyCount ?? 0) - 1, 0) }
                : r,
            ),
          );
        }
      }
    },
    [allReviewReplies],
  );

  useEffect(() => {
    if (!enabled || !targetEntityId) return;

    return subscribeReviewEvents({
      entityId: targetEntityId,
      onReview: ({ action, data }) => applyReviewSocket(action, data),
      onReviewReply: ({ action, data }) => applyReplySocket(action, data),
    });
  }, [enabled, targetEntityId, applyReviewSocket, applyReplySocket]);

  const buildListBody = useCallback(
    (
      data: Pick<GetReviewsRequest, "targetEntityId" | "targetEntityType">,
      nextToken?: string,
      queryOverride?: ReviewsListQuery,
    ): GetReviewsRequest => {
      const query = queryOverride ?? listQueryRef.current ?? {};
      return {
        pagination: {
          limit: query.pagination?.limit ?? 10,
          nextToken,
        },
        sort: query.sort ?? { by: "createdAt", order: "desc" },
        search: query.search,
        filters: query.filters as ReviewFilters | undefined,
        ...data,
      };
    },
    [],
  );

  const handleFetchReviewsApi = useCallback(
    async (
      data: Pick<GetReviewsRequest, "targetEntityId" | "targetEntityType">,
      options?: { reset?: boolean; query?: ReviewsListQuery },
    ) => {
      try {
        setIsLoading(true);

        const nextToken = options?.reset ? undefined : reviewApiNextToken;
        if (options?.reset) {
          setReviewApiNextToken(undefined);
        }

        const apiRes = await listReviews(
          scope,
          buildListBody(data, nextToken, options?.query),
          accessToken,
        );

        if (apiRes.success) {
          setAllReviews((prev) =>
            mergeReviews({
              existing: options?.reset ? [] : prev,
              loaded: apiRes.items,
              socketEvents: [],
            }),
          );
          setReviewApiNextToken(apiRes.nextToken);
          setTotalReviewsCount(apiRes.total || 0);
          return true;
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [scope, accessToken, reviewApiNextToken, buildListBody],
  );

  const refetchReviews = useCallback(
    async (
      data: Pick<GetReviewsRequest, "targetEntityId" | "targetEntityType">,
      query?: ReviewsListQuery,
    ) => {
      return handleFetchReviewsApi(data, { reset: true, query });
    },
    [handleFetchReviewsApi],
  );

  useEffect(() => {
    if (!enabled || !targetEntityId || !refetchKey) return;

    resetReviewPagination();
    void refetchReviews(
      { targetEntityId, targetEntityType },
      listQueryRef.current,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchKey, listQueryKey, targetEntityId, targetEntityType, enabled]);

  const handleAddReviewApi = useCallback(
    async (reviewData: CreateReviewRequest) => {
      if (!accessToken) return false;
      setIsLoading(true);
      try {
        const apiRes = await createReviewApi(reviewData, accessToken);
        if (apiRes.success) {
          optimisticReviewIds.current.add(apiRes.item.id);
          setAllReviews((prev) =>
            mergeReviews({
              existing: prev,
              loaded: [apiRes.item],
              socketEvents: [],
            }),
          );
          setTotalReviewsCount((prev) => prev + 1);
          return true;
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  const handleUpdateReviewApi = useCallback(
    async (reviewData: UpdateReviewRequest) => {
      if (!accessToken) return false;
      setIsLoading(true);
      try {
        const apiRes = await updateReviewApi(reviewData, accessToken);
        return Boolean(apiRes.success);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  const handleDeleteReviewApi = useCallback(
    async (reviewData: DeleteReviewRequest) => {
      if (!accessToken) return false;
      setIsLoading(true);
      try {
        const apiRes = await deleteReviewApi(reviewData, accessToken);
        return Boolean(apiRes.success);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  const handleFetchReviewRepliesApi = useCallback(
    async (
      data: Pick<
        GetReviewRepliesRequest,
        "targetEntityId" | "targetEntityType" | "reviewId"
      >,
    ) => {
      try {
        setIsRepliesLoading((prev) => ({
          ...prev,
          [data.reviewId]: true,
        }));

        const apiRes = await listReviewReplies(
          scope,
          {
            pagination: {
              limit: 5,
              nextToken: reviewReplyApiNextToken?.[data.reviewId],
            },
            sort: { by: "createdAt", order: "desc" },
            ...data,
          },
          accessToken,
        );

        if (apiRes.success) {
          setAllReviewReplies((prev) =>
            mergeReviewReplies({
              existing: prev,
              loaded: apiRes.items,
              socketEvents: [],
            }),
          );

          setReviewReplyApiNextToken((prev) => ({
            ...prev,
            [data.reviewId]: apiRes.nextToken,
          }));

          setReviewReplies((prev) => {
            const currentForReview = prev[data.reviewId] || [];
            return {
              ...prev,
              [data.reviewId]: mergeReviewReplies({
                existing: currentForReview,
                loaded: apiRes.items,
                socketEvents: [],
              }),
            };
          });

          return apiRes.items;
        }
        return [];
      } finally {
        setIsRepliesLoading((prev) => ({
          ...prev,
          [data.reviewId]: false,
        }));
      }
    },
    [scope, accessToken, reviewReplyApiNextToken],
  );

  const handleAddReplyApi = useCallback(
    async (reviewData: CreateReviewReplyRequest) => {
      if (!accessToken) return false;
      setIsLoading(true);
      try {
        const apiRes = await createReviewReplyApi(reviewData, accessToken);
        if (apiRes.success) {
          setAllReviewReplies((prev) =>
            mergeReviewReplies({
              existing: prev,
              loaded: [apiRes.item],
              socketEvents: [],
            }),
          );

          setReviewReplies((prev) => {
            const currentForReview = prev[reviewData.reviewId] || [];
            return {
              ...prev,
              [reviewData.reviewId]: mergeReviewReplies({
                existing: currentForReview,
                loaded: [apiRes.item],
                socketEvents: [],
              }),
            };
          });

          optimisticReplyIds.current.add(apiRes.item.id);
          setAllReviews((prev) =>
            prev.map((r) =>
              r.id === reviewData.reviewId
                ? { ...r, replyCount: (r.replyCount ?? 0) + 1 }
                : r,
            ),
          );
          return true;
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  const handleUpdateReplyApi = useCallback(
    async (reviewData: UpdateReviewReplyRequest) => {
      if (!accessToken) return false;
      setIsLoading(true);
      try {
        const apiRes = await updateReviewReplyApi(reviewData, accessToken);
        return Boolean(apiRes);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  const handleDeleteReplyApi = useCallback(
    async (data: DeleteReviewReplyRequest) => {
      if (!accessToken) return false;
      setIsLoading(true);
      try {
        const apiRes = await deleteReviewReplyApi(data, accessToken);
        return Boolean(apiRes);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  return {
    handleFetchReviewsApi,
    refetchReviews,
    resetReviewPagination,
    handleAddReviewApi,
    handleUpdateReviewApi,
    handleDeleteReviewApi,
    handleFetchReviewRepliesApi,
    handleAddReplyApi,
    handleUpdateReplyApi,
    handleDeleteReplyApi,
    setReviewReplies,
    setAllReviews,
    allReviewReplies,
    allReviews,
    reviewReplies,
    totalReviewsCount,
    reviewApiNextToken,
    reviewReplyApiNextToken,
    isLoading,
    isRepliesLoading,
  };
};
