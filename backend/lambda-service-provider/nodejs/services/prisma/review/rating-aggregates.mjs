const PUBLISHED_REVIEW_WHERE = {
  deleted: false,
  status: "PUBLISHED",
};

/**
 * Aggregate published review ratings for a clinic or specialist target.
 */
export const computePublishedReviewAggregates = async (
  prisma,
  targetEntityType,
  targetEntityId,
) => {
  if (!targetEntityType || !targetEntityId) {
    return { reviewCount: 0, ratingSum: 0, avgRating: 0 };
  }

  const result = await prisma.review.aggregate({
    where: {
      targetEntityType,
      targetEntityId,
      ...PUBLISHED_REVIEW_WHERE,
    },
    _count: { _all: true },
    _sum: { rating: true },
  });

  const reviewCount = result._count?._all ?? 0;
  const ratingSum = result._sum?.rating ?? 0;
  const avgRating =
    reviewCount > 0 ? Number((ratingSum / reviewCount).toFixed(2)) : 0;

  return { reviewCount, ratingSum, avgRating };
};

/**
 * Recompute and persist rating aggregates on the target clinic or specialist row.
 */
export const syncTargetRatingAggregates = async (
  prisma,
  targetEntityType,
  targetEntityId,
) => {
  const aggregates = await computePublishedReviewAggregates(
    prisma,
    targetEntityType,
    targetEntityId,
  );

  if (targetEntityType === "CLINIC") {
    await prisma.clinic.update({
      where: { id: targetEntityId },
      data: aggregates,
    });
  } else if (targetEntityType === "SPECIALIST") {
    await prisma.specialist.update({
      where: { id: targetEntityId },
      data: aggregates,
    });
  }

  return aggregates;
};
