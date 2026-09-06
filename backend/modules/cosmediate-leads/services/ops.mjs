import { DateTime } from "luxon";

import {
  addRangeFilter,
  normalizeDate,
} from "/opt/nodejs/lib/openSearch/utils.mjs";
import {
  encodeToken,
  decodeToken,
} from "/opt/nodejs/lib/encoding/base64-json.codec.mjs";

export const openSearchQuery = async ({
  opsClient,
  query,
  indexAlias,
  isTopSearchedSpecialistsReq,
}) => {
  const { filters = {}, search = {}, pagination = {} } = query;

  /**
   * ===========================================================
   * Normalize dates
   * ===========================================================
   */
  const createdFrom = normalizeDate({
    input: filters?.createdAt?.[0] ?? null,
    isStartOfDay: true,
    isEndOfDay: false,
  });
  const createdTo = normalizeDate({
    input: filters?.createdAt?.[1] ?? null,
    isStartOfDay: false,
    isEndOfDay: true,
  });
  const updatedFrom = normalizeDate({
    input: filters?.updatedAt?.[0] ?? null,
    isStartOfDay: true,
    isEndOfDay: false,
  });
  const updatedTo = normalizeDate({
    input: filters?.updatedAt?.[1] ?? null,
    isStartOfDay: false,
    isEndOfDay: true,
  });

  const opsQuery = {
    bool: {
      must: [],
      filter: [],
      should: [
        { term: { deleted: false } },
        { bool: { must_not: { exists: { field: "deleted" } } } },
      ],
      minimum_should_match: 1,
    },
  };

  let sort = [];

  if (query?.sort?.by && query?.sort?.order) {
    const sortBy = query.sort.by.includes("price")
      ? "minPrice"
      : query.sort.by.includes("rating")
      ? "avgRating"
      : query.sort.by.includes("name")
      ? "fullName.keyword"
      : "fullName.keyword";
    const sortOrder = query.sort.order.includes("asc") ? "asc" : "desc";

    sort.push({ [sortBy]: { order: sortOrder } });
  }

  if (isTopSearchedSpecialistsReq) {
    sort.push({ searchClicks: { order: "desc", missing: "_last" } });

    // Only return specialists that have at least 1 search count
    opsQuery.bool.filter.push({
      range: { searchClicks: { gte: 1 } },
    });
  }

  if (search?.query) {
    opsQuery.bool.must.push({
      multi_match: {
        query: search?.query.trim(),
        fields: ["firstName^3", "lastName^3", "email^2", "searchableText"],
        fuzziness: "AUTO",
      },
    });
  }

  // Exact match filters
  // if (query?.clinicId) {
  //   opsQuery.bool.filter.push({
  //     term: { clinicId: query.clinicId },
  //   });
  // }
  // if (query?.specialistId) {
  //   opsQuery.bool.filter.push({
  //     term: { specialistId: query.specialistId },
  //   });
  // }

  // Nested filters
  // if (query?.workingAt?.length) {
  //   opsQuery.bool.filter.push({
  //     nested: {
  //       path: "workingAt",
  //       query: {
  //         terms: { "workingAt.name": query.workingAt },
  //       },
  //     },
  //   });
  // }

  addRangeFilter(opsQuery, "age", filters?.ageMin, filters?.ageMax);
  addRangeFilter(opsQuery, "createdAt", createdFrom, createdTo);
  addRangeFilter(opsQuery, "updatedAt", updatedFrom, updatedTo);

  console.log("OPS query", JSON.stringify(opsQuery));

  sort =
    sort.length === 0
      ? [{ createdAt: "desc" }, { _id: "asc" }]
      : [...sort, { _id: "asc" }];

  const size = pagination?.limit ?? 10;

  const response = await opsClient.search({
    index: indexAlias,
    body: {
      query: opsQuery,
      sort,
      size,
      track_total_hits: true,
      ...(pagination?.nextToken
        ? { search_after: decodeToken(pagination?.nextToken) }
        : {}),
    },
  });

  console.log("Response from OPS query:", JSON.stringify(response));

  const hits = response.body?.hits?.hits ?? [];
  const total = response.body?.hits?.total?.value ?? 0;

  const hasNextPage = hits.length === size;
  const lastHit = hits[hits.length - 1];
  const nextToken =
    hasNextPage && lastHit?.sort ? encodeToken(lastHit.sort) : null;

  return {
    items: hits.map((h) => h._source),
    total,
    nextToken,
  };
};
