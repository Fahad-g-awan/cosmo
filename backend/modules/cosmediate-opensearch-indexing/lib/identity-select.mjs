/**
 * Shared Prisma select for Identity fields merged into OpenSearch profile docs.
 */
export const IDENTITY_SEARCH_SELECT = {
  id: true,
  cognitoSub: true,
  email: true,
  phone: true,
  status: true,
  role: true,
  perms: true,
  linkedProviders: true,
  defaultPasswordUsed: true,
  passwordSet: true,
};
