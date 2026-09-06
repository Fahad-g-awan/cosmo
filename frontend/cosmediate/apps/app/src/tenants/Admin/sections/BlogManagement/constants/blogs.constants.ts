export const ALLOWED_FIELDS = new Set([
  "blogImage",
  "title",
  "overview",
  "content",
  "status",
  "publishedAt",
  "tags",
  "categoryId",
]);

export const STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Hidden", value: "HIDDEN" },
];
