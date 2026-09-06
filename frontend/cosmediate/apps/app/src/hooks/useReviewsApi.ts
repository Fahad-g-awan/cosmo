import { useAuth } from "@cosmediate/auth";
import {
  resolveEntityType,
  useReviewsData,
  type ReviewsListQuery,
} from "@cosmediate/reviews-core";
import type { Clinic, Specialist } from "@cosmediate/type-utils";

import { useWorkspace } from "@app/context/WorkspaceContext";

export const useReviewsApi = ({
  entity,
  listQuery,
}: {
  entity: Clinic | Specialist;
  listQuery: ReviewsListQuery;
}) => {
  const { session, userRole } = useAuth();
  const { activeClinicId } = useWorkspace();

  const targetEntityId = entity.id;
  const targetEntityType = resolveEntityType(entity);
  const refetchKey =
    userRole === "MANAGER"
      ? (activeClinicId ?? targetEntityId)
      : targetEntityId;

  return useReviewsData({
    targetEntityId,
    targetEntityType,
    scope: "management",
    accessToken: session?.tokens?.accessToken,
    refetchKey,
    listQuery,
    enabled: Boolean(targetEntityId && session?.tokens?.accessToken),
  });
};

export type AppReviewsApi = ReturnType<typeof useReviewsApi>;
