import type { Review } from "@cosmediate/type-utils";

import type {
  ReviewChartBin,
  ReviewChartBinsResult,
  ReviewChartRange,
} from "../types";

const DAY_MS = 86400000;

const WEEKDAY_LABEL = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "long" });

const SHORT_DATE_LABEL = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const reviewCountTooltip = (dayLabel: string, count: number) =>
  count > 0
    ? `${dayLabel}: ${count} review${count === 1 ? "" : "s"}`
    : `${dayLabel}: no reviews`;

const reviewScoreTooltip = (dayLabel: string, reviewCount: number, avg: number) =>
  reviewCount > 0
    ? `${dayLabel}: ${avg} avg rating`
    : `${dayLabel}: no reviews`;

const makeCountBin = (
  data: number,
  count: number,
  dayLabel: string,
): ReviewChartBin => ({
  data,
  count,
  label: dayLabel,
  tooltip: reviewCountTooltip(dayLabel, count),
});

const makeScoreBin = (
  data: number,
  reviewCount: number,
  totalRating: number,
  dayLabel: string,
): ReviewChartBin => {
  const avg =
    reviewCount > 0
      ? Math.round((totalRating / reviewCount) * 100) / 100
      : 0;

  return {
    data,
    count: avg,
    label: dayLabel,
    tooltip: reviewScoreTooltip(dayLabel, reviewCount, avg),
  };
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getMondayOfWeek = (date: Date) => {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const buildDayMap = (reviews: Review[], days: number) => {
  const today = startOfDay(new Date());
  const dayMap = new Map<number, { totalRating: number; count: number }>();

  for (let i = 0; i < days; i++) {
    dayMap.set(i, { totalRating: 0, count: 0 });
  }

  for (const review of reviews) {
    const reviewDate = startOfDay(new Date(review.createdAt));
    const diffDays = Math.floor(
      (today.getTime() - reviewDate.getTime()) / DAY_MS,
    );

    if (diffDays >= 0 && diffDays < days) {
      const entry = dayMap.get(diffDays)!;
      entry.count += 1;
      entry.totalRating += parseFloat(review.rating) || 0;
    }
  }

  return { dayMap, today };
};

const findHighlightIndex = (bins: { count: number }[]) => {
  if (bins.length === 0) return 0;
  let max = 0;
  let index = bins.length - 1;
  bins.forEach((bin, i) => {
    if (bin.count > max) {
      max = bin.count;
      index = i;
    }
  });
  return index;
};

export const computeReviewChartBins = (
  reviews: Review[],
  range: ReviewChartRange,
): ReviewChartBinsResult => {
  const { dayMap, today } = buildDayMap(reviews, 30);

  if (range === "week") {
    const monday = getMondayOfWeek(today);
    const weekBins: ReviewChartBin[] = [];
    const weekScoreBins: ReviewChartBin[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayLabel = WEEKDAY_LABEL(day);
      const diffDays = Math.floor(
        (today.getTime() - startOfDay(day).getTime()) / DAY_MS,
      );
      const entry =
        diffDays >= 0 && diffDays < 30
          ? dayMap.get(diffDays)!
          : { totalRating: 0, count: 0 };

      weekBins.push(makeCountBin(i + 1, entry.count, dayLabel));
      weekScoreBins.push(
        makeScoreBin(i + 1, entry.count, entry.totalRating, dayLabel),
      );
    }

    const todayEntry = dayMap.get(0)!;

    return {
      reviewCountBins: weekBins,
      reviewScoreBins: weekScoreBins,
      todayReviewCount: todayEntry.count || undefined,
      todayAvgRating:
        todayEntry.count > 0
          ? Math.round((todayEntry.totalRating / todayEntry.count) * 10) / 10
          : undefined,
      highlightIndex: findHighlightIndex(weekBins),
    };
  }

  const reviewCountBins: ReviewChartBin[] = [];
  const reviewScoreBins: ReviewChartBin[] = [];

  for (let i = 29; i >= 0; i--) {
    const entry = dayMap.get(i)!;
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dayLabel = SHORT_DATE_LABEL(day);
    const dayIndex = 30 - i;

    reviewCountBins.push(makeCountBin(dayIndex, entry.count, dayLabel));
    reviewScoreBins.push(
      makeScoreBin(dayIndex, entry.count, entry.totalRating, dayLabel),
    );
  }

  const todayEntry = dayMap.get(0)!;

  return {
    reviewCountBins,
    reviewScoreBins,
    todayReviewCount: todayEntry.count || undefined,
    todayAvgRating:
      todayEntry.count > 0
        ? Math.round((todayEntry.totalRating / todayEntry.count) * 10) / 10
        : undefined,
    highlightIndex: findHighlightIndex(reviewCountBins),
  };
};

export const getHighlightRange = (
  bins: { data: number }[],
  highlightIndex: number,
): [number, number] => {
  const value = bins[highlightIndex]?.data ?? bins[0]?.data ?? 1;
  return [value, value];
};
