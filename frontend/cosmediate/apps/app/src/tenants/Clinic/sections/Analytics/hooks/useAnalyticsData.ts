import { useCallback, useEffect, useMemo, useState } from "react";

import {
  computeReviewChartBins,
  resolveEntityType,
  type ReviewChartRange,
} from "@cosmediate/reviews-core";
import type { Clinic, Specialist } from "@cosmediate/type-utils";
import { getPatientsApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import { useWorkspaceListScope } from "@app/hooks/useWorkspaceListScope";

import { generateImpressionsData } from "../lib/utils";
import { useAnalyticsReviews } from "./useAnalyticsReviews";

type CountsData = {
  totalCount: number;
  todayCount?: number;
};

interface UseAnalyticsDataProps {
  activeEntity: Clinic | Specialist | null;
  treatmentsCount: number;
  clinicCount?: number;
  /** Manager clinic id — refetch on clinic switch only */
  refetchKey?: string;
  accessToken?: string;
}

interface UseAnalyticsDataReturnType {
  analyticsData: {
    title: string;
    totalCount: number;
    todayCount?: number;
    isUpcomingFeature?: boolean;
    colSpan?: number;
  }[];
  analyticsChartData: {
    title: string;
    totalCount: number;
    todayCount?: number;
    chartData?: { data: number; count: number }[];
    highlightIndex?: number;
    chartRange?: ReviewChartRange;
    onChartRangeChange?: (range: ReviewChartRange) => void;
    isUpcomingFeature?: boolean;
  }[];
  isLoading: boolean;
}

export const useAnalyticsData = ({
  activeEntity,
  treatmentsCount,
  clinicCount,
  refetchKey,
  accessToken,
}: UseAnalyticsDataProps): UseAnalyticsDataReturnType => {
  const { session } = useAuth();
  const token = accessToken ?? session?.tokens?.accessToken;

  const { listFilters } = useWorkspaceListScope({
    tab: "patients",
  });

  const [incomingRequestsCount, setIncomingRequestsCount] =
    useState<CountsData>();
  const [appointmentsCount, setAppointmentsCount] = useState<CountsData>();
  const [impressionsCount, setImpressionsCount] = useState<CountsData>();
  const [patientsCount, setPatientsCount] = useState(0);
  const [reviewScoreRange, setReviewScoreRange] =
    useState<ReviewChartRange>("week");
  const [reviewsCountRange, setReviewsCountRange] =
    useState<ReviewChartRange>("week");

  const { reviews, isLoading: isReviewsLoading } = useAnalyticsReviews({
    entity: activeEntity,
    accessToken: token,
    refetchKey,
    enabled: Boolean(refetchKey && activeEntity?.id),
  });

  const impressionsData = useMemo(() => generateImpressionsData(), []);

  const reviewScoreBins = useMemo(
    () => computeReviewChartBins(reviews, reviewScoreRange),
    [reviews, reviewScoreRange],
  );

  const reviewCountBins = useMemo(
    () => computeReviewChartBins(reviews, reviewsCountRange),
    [reviews, reviewsCountRange],
  );

  const handleFetchPatientsCount = useCallback(async () => {
    if (!token || !refetchKey) return;

    try {
      const apiRes = await getPatientsApi(
        {
          pagination: { limit: 1 },
          filters: listFilters,
        },
        token,
      );

      if (apiRes.success) {
        setPatientsCount(apiRes.total ?? 0);
      }
    } catch {
      setPatientsCount(0);
    }
  }, [token, refetchKey, listFilters]);

  useEffect(() => {
    if (!refetchKey) return;
    void handleFetchPatientsCount();
  }, [refetchKey, listFilters, handleFetchPatientsCount]);

  useEffect(() => {
    setIncomingRequestsCount({
      totalCount: 4,
      todayCount: 2,
    });

    setAppointmentsCount({
      totalCount: 32,
      todayCount: 5,
    });

    setImpressionsCount({
      totalCount: impressionsData.totalCount,
      todayCount: impressionsData.todayCount,
    });
  }, [impressionsData.totalCount, impressionsData.todayCount]);

  const specialistCount = activeEntity
    ? resolveEntityType(activeEntity) === "CLINIC"
      ? (activeEntity as Clinic)?.specialistCount || 0
      : 0
    : 0;

  return {
    analyticsData: [
      {
        title: "incoming requests",
        totalCount: incomingRequestsCount?.totalCount || 0,
        todayCount: incomingRequestsCount?.todayCount || 0,
        isUpcomingFeature: true,
        colSpan: 2 as const,
      },
      {
        title: "current appointments",
        totalCount: appointmentsCount?.totalCount || 0,
        todayCount: appointmentsCount?.todayCount || 0,
        isUpcomingFeature: true,
        colSpan: 2 as const,
      },
      {
        title: "my clinics",
        totalCount: clinicCount || 0,
      },
      {
        title: "treatments",
        totalCount: treatmentsCount || 0,
      },
      {
        title: "specialists",
        totalCount: specialistCount,
      },
      {
        title: "patients",
        totalCount: patientsCount,
      },
    ],

    analyticsChartData: [
      {
        title: "impressions",
        totalCount: impressionsCount?.totalCount || 0,
        todayCount: impressionsCount?.todayCount || 0,
        chartData: impressionsData.bins,
        isUpcomingFeature: true,
      },
      {
        title: "review score",
        totalCount: Number(activeEntity?.avgRating?.toFixed(2)) || 0,
        todayCount: reviewScoreBins.todayAvgRating,
        chartData: reviewScoreBins.reviewScoreBins,
        highlightIndex: reviewScoreBins.highlightIndex,
        chartRange: reviewScoreRange,
        onChartRangeChange: setReviewScoreRange,
      },
      {
        title: "reviews",
        totalCount: activeEntity?.reviewCount || 0,
        todayCount: reviewCountBins.todayReviewCount,
        chartData: reviewCountBins.reviewCountBins,
        highlightIndex: reviewCountBins.highlightIndex,
        chartRange: reviewsCountRange,
        onChartRangeChange: setReviewsCountRange,
      },
    ],

    isLoading: isReviewsLoading,
  };
};
