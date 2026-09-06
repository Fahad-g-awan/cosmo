const distanceKm = {
  oneOf: [
    { type: "number", minimum: 0 },
    {
      type: "array",
      items: [{ type: "number" }, { type: "number" }],
      minItems: 1,
      maxItems: 2,
    },
  ],
};

export const geoListFilters = {
  userLocation: {
    type: "object",
    additionalProperties: false,
    required: ["lat", "lon"],
    properties: {
      lat: { type: "number" },
      lon: { type: "number" },
    },
  },
  distance: distanceKm,
};

export const RangeFilter = {
  type: "array",
  items: [{ type: "string" }, { type: "string" }],
  minItems: 0,
  maxItems: 2,
};

export const openSearchListBody = () => ({
  type: "object",
  additionalProperties: false,
  properties: {
    filters: {
      type: "object",
      additionalProperties: true,
    },
    search: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string" },
      },
    },
    pagination: {
      type: "object",
      additionalProperties: false,
      properties: {
        page: { type: "integer", minimum: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100 },
        nextToken: { type: "string" },
      },
    },
    sort: {
      type: "object",
      additionalProperties: false,
      properties: {
        by: { type: "string" },
        order: { type: "string", enum: ["asc", "desc"] },
      },
    },
  },
});
