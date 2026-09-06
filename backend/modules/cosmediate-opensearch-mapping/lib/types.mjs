export const text = (extra = {}) => ({
  type: "text",
  analyzer: "standard",
  ...extra,
});
export const textAC = () => ({
  type: "text",
  fields: {
    keyword: { type: "keyword" },
    autocomplete: {
      type: "text",
      analyzer: "auto_complete",
      search_analyzer: "auto_search",
    },
  },
});
export const kw = (extra = {}) => ({ type: "keyword", ...extra });
export const kwNorm = () => ({ type: "keyword", normalizer: "lowercase_trim" }); // exact, case-insensitive
export const blobOff = () => ({ type: "object", enabled: false });
export const geoPoint = () => ({ type: "geo_point" });
export const Boolean = () => ({ type: "boolean" });
export const Integer = () => ({ type: "integer" });
export const Float = () => ({ type: "float" });
