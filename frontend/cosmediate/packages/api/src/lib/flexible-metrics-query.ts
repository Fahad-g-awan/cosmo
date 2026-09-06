export type FlexibleHomeMetricsFilters = {
  allowZeroSearchClicks?: boolean;
  allowZeroRating?: boolean;
};

export const buildFlexibleMetricsQuery = (
  params: {
    limit?: number;
    filters?: FlexibleHomeMetricsFilters;
  } = {},
) => {
  const searchParams = new URLSearchParams();

  if (params.limit != null) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.filters?.allowZeroSearchClicks) {
    searchParams.set("allowZeroSearchClicks", "true");
  }

  if (params.filters?.allowZeroRating) {
    searchParams.set("allowZeroRating", "true");
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};
