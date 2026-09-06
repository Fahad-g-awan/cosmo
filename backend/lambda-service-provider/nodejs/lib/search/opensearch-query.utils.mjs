import { DateTime } from "luxon";

import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../errors/http-error.mjs";

export const normalizeDate = ({ input, isStartOfDay, isEndOfDay }) => {
  if (!input) return null;

  if (isStartOfDay && isEndOfDay) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Date cannot be both start and end of day"],
    });
  }

  const formats = ["dd-MM-yyyy", "MM/dd/yyyy", "yyyy-MM-dd"];

  for (const f of formats) {
    const dt = DateTime.fromFormat(input, f, { zone: "utc" });
    if (dt.isValid) {
      return isStartOfDay
        ? dt.startOf("day").toISO()
        : isEndOfDay
          ? dt.endOf("day").toISO()
          : dt.toISO();
    }
  }

  const dtISO = DateTime.fromISO(input, { zone: "utc" });
  if (dtISO.isValid) {
    return isStartOfDay
      ? dtISO.startOf("day").toISO()
      : isEndOfDay
        ? dtISO.endOf("day").toISO()
        : dtISO.toISO();
  }

  throw httpError({
    error: API_ERRORS.BAD_REQUEST,
    details: ["Invalid date format"],
  });
};

export const addRangeFilter = (opsQuery, fieldName, minVal, maxVal) => {
  if (
    (minVal === undefined || minVal === null) &&
    (maxVal === undefined || maxVal === null)
  )
    return;

  const range = {};
  if (minVal != null) range.gte = minVal;
  if (maxVal != null) range.lte = maxVal;

  opsQuery.bool.filter.push({ exists: { field: fieldName } });
  opsQuery.bool.filter.push({ range: { [fieldName]: range } });
};

export const getTotalCountFromOPS = async (
  opsClient,
  indexAlias,
  entityType,
  filters = {},
) => {
  const must = [{ term: { GSI4SK: entityType } }];
  const filter = [{ term: { deleted: false } }];

  if (filters.searchText) {
    must.push({
      multi_match: {
        query: filters.searchText.trim(),
        fields: ["firstName^3", "lastName^3", "searchableText"],
        fuzziness: "AUTO",
      },
    });
  }

  if (filters.termFilters && typeof filters.termFilters === "object") {
    for (const [field, value] of Object.entries(filters.termFilters)) {
      filter.push({ term: { [field]: value } });
    }
  }

  if (filters.rangeFilters && typeof filters.rangeFilters === "object") {
    for (const [field, rangeObj] of Object.entries(filters.rangeFilters)) {
      filter.push({ range: { [field]: rangeObj } });
    }
  }

  const queryBody = { bool: { must, filter } };

  const res = await opsClient.count({
    index: indexAlias,
    body: { query: queryBody },
  });

  return res?.body?.count ?? 0;
};
