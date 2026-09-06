import { useCallback, useEffect, useState } from "react";

import { listReviews } from "@cosmediate/api";
import { resolveEntityType } from "@cosmediate/reviews-core";
import type { Clinic, Review, Specialist } from "@cosmediate/type-utils";

interface UseAnalyticsReviewsOptions {
  entity: Clinic | Specialist | null;
  accessToken?: string;
  /** Refetch when clinic switches (managers) or entity changes */
  refetchKey?: string;
  enabled?: boolean;
}

export const useAnalyticsReviews = ({
  entity,
  accessToken,
  refetchKey,
  enabled = true,
}: UseAnalyticsReviewsOptions) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const targetEntityId = entity?.id;
  const targetEntityType = entity ? resolveEntityType(entity) : undefined;

  const fetchReviews = useCallback(async () => {
    if (!enabled || !targetEntityId || !targetEntityType || !accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const apiRes = await listReviews(
        "management",
        {
          targetEntityId,
          targetEntityType,
          pagination: { limit: 100 },
          sort: { by: "createdAt", order: "desc" },
        },
        accessToken,
      );

      if (apiRes.success) {
        setReviews(apiRes.items);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, enabled, targetEntityId, targetEntityType]);

  useEffect(() => {
    if (!refetchKey || !targetEntityId) return;
    void fetchReviews();
  }, [refetchKey, targetEntityId, fetchReviews]);

  return { reviews, isLoading };
};
