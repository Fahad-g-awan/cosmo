"use client";

import { useState, useEffect, useCallback } from "react";

import {
  getTopSearchedTreatmentsApi,
  getTopSearchedBlogsApi,
  getPopularClinicsApi,
  getReviewsApi,
} from "@cosmediate/api";
import type { Clinic, Treatment, Review, Blog } from "@cosmediate/type-utils";

export interface HomePageData {
  clinics: Clinic[];
  treatments: Treatment[];
  reviews: Review[];
  blogs: Blog[];
  isLoading: boolean;
  isClinicsLoading: boolean;
  isTreatmentsLoading: boolean;
  isReviewsLoading: boolean;
  isBlogsLoading: boolean;
}

export const useHomePageData = (): HomePageData => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [isTreatmentsLoading, setIsTreatmentsLoading] = useState(true);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [isClinicsLoading, setIsClinicsLoading] = useState(true);
  const [isBlogsLoading, setIsBlogsLoading] = useState(true);

  const fetchHomePageData = useCallback(async () => {
    const flexibleFilters = {
      allowZeroSearchClicks: true,
    } as const;

    const [clinicsResult, treatmentsResult, blogsResult, reviewsResult] =
      await Promise.allSettled([
        getPopularClinicsApi({
          limit: 20,
          filters: { allowZeroRating: true },
        }),
        getTopSearchedTreatmentsApi({
          limit: 8,
          filters: flexibleFilters,
        }),
        getTopSearchedBlogsApi({
          limit: 3,
          filters: flexibleFilters,
        }),
        getReviewsApi({ pagination: { limit: 20 } }),
      ]);

    if (clinicsResult.status === "fulfilled") {
      const res = clinicsResult.value;
      if (res.success) {
        setClinics(res.items ?? []);
      }
    } else {
      console.error(
        "[useHomePageData] Failed to fetch clinics:",
        clinicsResult.reason,
      );
    }
    setIsClinicsLoading(false);

    if (treatmentsResult.status === "fulfilled") {
      const res = treatmentsResult.value;
      if (res.success) {
        setTreatments(res.items ?? []);
      }
    } else {
      console.error(
        "[useHomePageData] Failed to fetch treatments:",
        treatmentsResult.reason,
      );
    }
    setIsTreatmentsLoading(false);

    if (reviewsResult.status === "fulfilled") {
      const res = reviewsResult.value;
      if (res.success && res.items?.length) {
        setReviews(res.items);
      }
    } else {
      console.error(
        "[useHomePageData] Failed to fetch reviews:",
        reviewsResult.reason,
      );
    }
    setIsReviewsLoading(false);

    if (blogsResult.status === "fulfilled") {
      const res = blogsResult.value;
      if (res.success) {
        setBlogs(res.items ?? []);
      }
    } else {
      console.error(
        "[useHomePageData] Failed to fetch blogs:",
        blogsResult.reason,
      );
    }
    setIsBlogsLoading(false);
  }, []);

  useEffect(() => {
    fetchHomePageData();
  }, [fetchHomePageData]);

  const isLoading =
    isClinicsLoading ||
    isTreatmentsLoading ||
    isReviewsLoading ||
    isBlogsLoading;

  return {
    clinics,
    treatments,
    reviews,
    blogs,
    isLoading,
    isClinicsLoading,
    isTreatmentsLoading,
    isReviewsLoading,
    isBlogsLoading,
  };
};
