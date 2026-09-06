export const aliasFor = (base, env) => `${base}-${env}`;

export const removeUndefined = (obj) => JSON.parse(JSON.stringify(obj));

export const joinText = (parts) => parts.filter(Boolean).join(" ");

export const extractPlainTextFromHtmlJson = (json) => {
  if (!json) return "";
  if (typeof json === "string") {
    try {
      json = JSON.parse(json);
    } catch {
      return json;
    }
  }
  let out = "";
  const walk = (node) => {
    if (!node) return;
    if (node.text) out += `${node.text} `;
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(json);
  return out.trim();
};

/**
 * Shared OpenSearch fields for every indexed entity (clinic, treatment, admin, patient, …).
 *
 * @param {Object} data - The data object containing the entity fields.
 * @returns {Object} The base document data.
 */
export const getBaseDocData = (data) => ({
  id: data?.id,
  deleted: !!data?.deleted,
  createdAt: data?.createdAt,
  updatedAt: data?.updatedAt || data?.createdAt,
  deletedAt: data?.deleted ? data?.deletedAt : undefined,
  searchableText: "",
  entityType: data?.entityType,
});

/**
 * Identity-backed profile docs only (admin, patient, clinic manager, specialist when migrated).
 *
 * @param {Object} data - The data object containing the identity fields.
 * @returns {Object} The identity authentication fields.
 */
export const getIdentityAuthFields = (data) => ({
  identityId: data?.identityId,
  cognitoSub: data?.cognitoSub,
});

/**
 * Merge Identity scalars onto profile row for OpenSearch (profile `id` unchanged).
 */
export const mergeIdentityForSearchDoc = (profile, identity) => {
  if (!identity) return { ...profile };
  const { id: identityId, ...identityFields } = identity;
  return {
    ...profile,
    ...identityFields,
    identityId,
  };
};
