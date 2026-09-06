import { kw, text } from "../types.mjs";

export const getBaseProperties = () => ({
  id: kw(),
  identityId: kw(),
  cognitoSub: kw(),
  entityType: kw(),
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
  deletedAt: { type: "date" },
  deleted: { type: "boolean" },
  searchableText: text(),
});
