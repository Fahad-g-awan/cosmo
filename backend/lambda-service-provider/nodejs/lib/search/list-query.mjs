import { addRangeFilter, normalizeDate } from "./opensearch-query.utils.mjs";
import { decodeToken, encodeToken } from "../encoding/base64-json.codec.mjs";
import { httpError, isHttpError } from "../errors/http-error.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";

/** Bool query that excludes soft-deleted index documents. */
export const createActiveDocsQuery = () => ({
  bool: {
    must: [],
    filter: [],
    should: [
      { term: { deleted: false } },
      { bool: { must_not: { exists: { field: "deleted" } } } },
    ],
    minimum_should_match: 1,
  },
});

export const applyMultiMatchSearch = (opsQuery, { query, fields }) => {
  const text = String(query ?? "").trim();
  if (!text) return;

  opsQuery.bool.must.push({
    multi_match: {
      query: text,
      fields,
      fuzziness: "AUTO",
    },
  });
};

const LOCATION_TEXT_FIELDS = [
  "city^3",
  "country^2",
  "state^2",
  "completeAddress^2",
  "postalCode",
];

/** Text match for header location picker (address fields only). */
export const applyLocationTextFilter = (opsQuery, location) => {
  const text = String(location ?? "").trim();
  if (!text) return;

  opsQuery.bool.must.push({
    multi_match: {
      query: text,
      fields: LOCATION_TEXT_FIELDS,
      type: "cross_fields",
      operator: "and",
    },
  });
};

export const applyTermFilter = (opsQuery, field, value) => {
  if (value === undefined || value === null || value === "") return;
  opsQuery.bool.filter.push({ term: { [field]: value } });
};

export const applyTermsFilter = (opsQuery, field, values) => {
  if (!Array.isArray(values) || values.length === 0) return;
  opsQuery.bool.filter.push({ terms: { [field]: values } });
};

/** Accepts a single value or array (normalized to terms). */
export const applyTermOrTerms = (opsQuery, field, value) => {
  if (value === undefined || value === null || value === "") return;
  if (Array.isArray(value)) {
    applyTermsFilter(opsQuery, field, value);
    return;
  }
  applyTermFilter(opsQuery, field, value);
};

export const applyBooleanFilter = (opsQuery, field, value) => {
  if (value === undefined || value === null) return;
  opsQuery.bool.filter.push({ term: { [field]: Boolean(value) } });
};

/** `range` is `[min, max]` (either may be null). */
export const applyNumericRangeFilter = (opsQuery, field, range) => {
  if (!Array.isArray(range)) return;
  const [min, max] = range;
  addRangeFilter(opsQuery, field, min ?? null, max ?? null);
};

/** Reads `[min, max]` from `filters[field]`. */
export const resolveNumericRangeFilter = (filters = {}, field) => {
  const range = filters[field];
  if (Array.isArray(range) && range.length === 2) {
    return range;
  }

  const minKey = `${field}Min`;
  const maxKey = `${field}Max`;
  if (filters[minKey] !== undefined || filters[maxKey] !== undefined) {
    return [filters[minKey] ?? null, filters[maxKey] ?? null];
  }

  return undefined;
};

/**
 * `filters.createdAt` / `filters.updatedAt` as `[from, to]` date strings.
 */
export const applyTimestampRangeFilters = (opsQuery, filters = {}) => {
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

  addRangeFilter(opsQuery, "createdAt", createdFrom, createdTo);
  addRangeFilter(opsQuery, "updatedAt", updatedFrom, updatedTo);
};

/** Max distance in km from `filters.distance` (number or `[min, max]`). */
export const resolveDistanceKm = (distance) => {
  if (distance === undefined || distance === null || distance === "")
    return null;
  if (Array.isArray(distance)) {
    const max = distance[1] ?? distance[0];
    return max != null && max !== "" ? Number(max) : null;
  }
  const km = Number(distance);
  return Number.isFinite(km) ? km : null;
};

/**
 * `filters.userLocation` `{ lat, lon }` + `filters.distance` (km, number or range).
 */
export const applyGeoDistanceFilter = (opsQuery, filters = {}) => {
  const lat = filters?.userLocation?.lat;
  const lon = filters?.userLocation?.lon;
  const distanceKm = resolveDistanceKm(filters?.distance);

  if (lat == null || lon == null || distanceKm == null) return;

  opsQuery.bool.filter.push({
    geo_distance: {
      distance: `${distanceKm}km`,
      location: { lat, lon },
    },
  });
};

/**
 * @param {object} params
 * @param {object} [params.sort]
 * @param {Record<string, string>} params.fieldMap - API sort key → OpenSearch field
 * @param {object[]} [params.defaultSort]
 * @param {{ userLocation?: { lat: number, lon: number }, whenFiltered?: boolean }} [params.geo]
 *
 * Prepends `_geo_distance` sort when sorting by distance or when a geo filter is active.
 */
export const resolveSort = ({ sort, fieldMap, defaultSort, geo }) => {
  const fallback = defaultSort ?? [{ createdAt: "desc" }, { _id: "asc" }];

  const useGeoSort =
    geo?.userLocation?.lat != null &&
    geo?.userLocation?.lon != null &&
    (sort?.by === "distance" || geo?.whenFiltered);

  let clause;
  if (!sort?.by) {
    clause = [...fallback];
  } else if (sort.by === "distance" && useGeoSort) {
    clause = [];
  } else {
    const field = fieldMap[sort.by] ?? fieldMap.createdAt ?? "createdAt";
    const order = sort.order === "asc" ? "asc" : "desc";
    clause = [{ [field]: { order } }, { _id: "asc" }];
  }

  if (useGeoSort) {
    clause.unshift({
      _geo_distance: {
        location: {
          lat: geo.userLocation.lat,
          lon: geo.userLocation.lon,
        },
        order: sort?.order === "desc" ? "desc" : "asc",
        unit: "km",
        mode: "min",
        distance_type: "arc",
      },
    });
    if (!clause.some((s) => s._id)) {
      clause.push({ _id: "asc" });
    }
  }

  return clause;
};

const formatOpenSearchErrorBody = (body) => {
  if (body == null) return null;
  if (typeof body === "string") return body.slice(0, 500);
  try {
    return JSON.stringify(body).slice(0, 500);
  } catch {
    return String(body).slice(0, 500);
  }
};

const resolveSearchHttpError = (error, indexAlias) => {
  if (isHttpError(error)) return error;

  const statusCode = error?.meta?.statusCode ?? error?.statusCode ?? undefined;
  const responseBody = error?.meta?.body ?? error?.body ?? undefined;

  const details = [
    `index=${indexAlias}`,
    statusCode != null ? `opensearchStatus=${statusCode}` : null,
    error?.message,
    formatOpenSearchErrorBody(responseBody),
  ].filter(Boolean);

  if (statusCode === 404) {
    return httpError({
      error: API_ERRORS.NOT_FOUND,
      message: `Search index not found: ${indexAlias}`,
      details,
    });
  }

  if (statusCode === 403) {
    return httpError({
      error: API_ERRORS.FORBIDDEN,
      message: "Search request forbidden",
      details,
    });
  }

  return httpError({
    error: API_ERRORS.INTERNAL_ERROR,
    message: "Search request failed",
    details,
  });
};

/**
 * Runs a search_after paginated query and returns list DTO fields.
 *
 * @param {boolean} [useLimitPlusOne] — fetch `limit + 1` rows to detect next page (users module style).
 */
export const runPaginatedSearch = async ({
  opsClient,
  indexAlias,
  opsQuery,
  sort,
  pagination = {},
  useLimitPlusOne = false,
}) => {
  const limit = pagination?.limit ?? 10;
  const size = useLimitPlusOne ? limit + 1 : limit;

  const searchBody = {
    query: opsQuery,
    sort,
    size,
    track_total_hits: true,
    ...(pagination?.nextToken
      ? { search_after: decodeToken(pagination.nextToken) }
      : {}),
  };

  console.log("[runPaginatedSearch] request", {
    index: indexAlias,
    limit,
    size,
    hasNextToken: Boolean(pagination?.nextToken),
    body: searchBody,
  });

  try {
    const response = await opsClient.search({
      index: indexAlias,
      body: searchBody,
    });

    let hits = response.body?.hits?.hits ?? [];
    const total = response.body?.hits?.total?.value ?? 0;
    const hasNextPage = useLimitPlusOne
      ? hits.length > limit
      : hits.length === size;

    if (hasNextPage && useLimitPlusOne) {
      hits = hits.slice(0, limit);
    }

    const lastHit = hits[hits.length - 1];
    const nextToken =
      hasNextPage && lastHit?.sort ? encodeToken(lastHit.sort) : null;

    return {
      items: hits.map((h) => h._source),
      total,
      nextToken,
    };
  } catch (error) {
    const statusCode =
      error?.meta?.statusCode ?? error?.statusCode ?? undefined;
    const responseBody = error?.meta?.body ?? error?.body ?? undefined;

    console.error("[runPaginatedSearch] OpenSearch search failed", {
      index: indexAlias,
      statusCode,
      message: error?.message,
      name: error?.name,
      body: responseBody,
      query: searchBody,
    });

    throw resolveSearchHttpError(error, indexAlias);
  }
};
