export const HISTOGRAM_BIN_COUNT = 30;

const ACTIVE_DOC_QUERY = {
  bool: {
    should: [
      { term: { deleted: false } },
      { bool: { must_not: { exists: { field: "deleted" } } } },
    ],
  },
};

const POSITIVE_PRICE_QUERY = (field) => ({
  bool: {
    must: [ACTIVE_DOC_QUERY, { range: { [field]: { gt: 0 } } }],
  },
});

export const roundPriceBound = (value, mode = "floor") => {
  if (!Number.isFinite(value)) return 0;
  return mode === "ceil" ? Math.ceil(value) : Math.floor(value);
};

export const getPriceFieldStats = async ({ opsClient, indexAlias, field }) => {
  if (!opsClient || !indexAlias) {
    return { minPrice: 0, maxPrice: 0 };
  }

  const response = await opsClient.search({
    index: indexAlias,
    body: {
      size: 0,
      query: POSITIVE_PRICE_QUERY(field),
      aggs: {
        min_value: { min: { field } },
        max_value: { max: { field } },
      },
    },
  });

  const min = response.body?.aggregations?.min_value?.value;
  const max = response.body?.aggregations?.max_value?.value;

  return {
    minPrice: roundPriceBound(min, "floor"),
    maxPrice: roundPriceBound(max, "ceil"),
  };
};

/**
 * Count documents in each fixed UI bin (aligned to integer min/max bounds).
 */
export const buildFixedBinHistogram = async ({
  opsClient,
  indexAlias,
  field,
  minPrice,
  maxPrice,
  binCount = HISTOGRAM_BIN_COUNT,
}) => {
  if (!opsClient || !indexAlias || maxPrice <= minPrice) return [];

  const min = roundPriceBound(minPrice, "floor");
  const max = roundPriceBound(maxPrice, "ceil");
  const span = max - min;
  if (span <= 0) {
    return [{ priceFrom: min, priceTo: max, count: 0 }];
  }

  const binWidth = span / binCount;
  const aggs = {};

  for (let i = 0; i < binCount; i++) {
    const from = min + i * binWidth;
    const isLast = i === binCount - 1;
    const range = isLast
      ? { gte: from, lte: max }
      : { gte: from, lt: min + (i + 1) * binWidth };

    aggs[`b${i}`] = {
      filter: {
        bool: {
          must: [POSITIVE_PRICE_QUERY(field), { range: { [field]: range } }],
        },
      },
    };
  }

  const response = await opsClient.search({
    index: indexAlias,
    body: { size: 0, aggs },
  });

  return Array.from({ length: binCount }, (_, i) => {
    const priceFrom = Math.round(min + i * binWidth);
    const priceTo = Math.round(min + (i + 1) * binWidth);
    return {
      priceFrom,
      priceTo,
      count: response.body?.aggregations?.[`b${i}`]?.doc_count ?? 0,
    };
  });
};
