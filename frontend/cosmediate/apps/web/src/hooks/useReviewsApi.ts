import { useAuth } from "@cosmediate/auth";
import {
  resolveEntityType,
  useReviewsData,
  type ReviewsListQuery,
} from "@cosmediate/reviews-core";
import type { Clinic, Specialist } from "@cosmediate/type-utils";

export const useReviewsApi = ({
  entity,
}: {
  entity: Clinic | Specialist;
}) => {
  const { session } = useAuth();
  const targetEntityId = entity.id;
  const targetEntityType = resolveEntityType(entity);

  const listQuery: ReviewsListQuery = {
    sort: { by: "createdAt", order: "desc" },
    pagination: { limit: 10 },
  };

  return useReviewsData({
    targetEntityId,
    targetEntityType,
    scope: "public",
    accessToken: session?.tokens?.accessToken,
    refetchKey: targetEntityId,
    listQuery,
    enabled: Boolean(targetEntityId),
  });
};

export type WebReviewsApi = ReturnType<typeof useReviewsApi>;
