import { DateTime } from "luxon";

import {
  addRangeFilter,
  normalizeDate,
} from "/opt/nodejs/lib/openSearch/utils.mjs";
import {
  encodeToken,
  decodeToken,
} from "/opt/nodejs/lib/encoding/base64-json.codec.mjs";

export const openSearchQuery = async ({ opsClient, query, indexAlias }) => {
  const createdFrom = normalizeDate(query?.createdDateFrom);
  let createdTo = normalizeDate(query?.createdDateTo);
  createdTo = createdTo
    ? DateTime.fromISO(createdTo).endOf("day").toISO()
    : null;
  const updatedFrom = normalizeDate(query?.updatedDateFrom);
  let updatedTo = normalizeDate(query?.updatedDateTo);
  updatedTo = updatedTo
    ? DateTime.fromISO(updatedTo).endOf("day").toISO()
    : null;

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

  if (query?.searchText) {
    opsQuery.bool.must.push({
      multi_match: {
        query: query?.searchText.trim(),
        fields: ["name^3", "searchableText"],
        fuzziness: "AUTO",
      },
    });
  }

  addRangeFilter(opsQuery, "createdAt", createdFrom, createdTo);
  addRangeFilter(opsQuery, "updatedAt", updatedFrom, updatedTo);

  console.log("OPS query", JSON.stringify(opsQuery));

  sort =
    sort.length === 0
      ? [{ createdAt: "desc" }, { _id: "asc" }]
      : [...sort, { _id: "asc" }];

  const response = await opsClient.search({
    index: indexAlias,
    body: {
      query: opsQuery,
      sort,
      size: query?.limit || 10,
      track_total_hits: true,
      ...(query?.nextToken
        ? { search_after: decodeToken(query?.nextToken) }
        : {}),
    },
  });

  console.log("Response from OPS query:", JSON.stringify(response));

  const hits = response.body?.hits?.hits ?? [];
  const total = response.body?.hits?.total?.value ?? 0;

  return {
    items: hits.map((h) => h._source),
    total,
    nextToken: hits.length ? encodeToken(hits[hits.length - 1].sort) : null,
  };
};
