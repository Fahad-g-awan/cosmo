import { SUPER_ACCESS_GRANT, formatGrantLabel } from "@app/lib/permissions";

export const formatPermsSummary = (perms: string[] = []): string => {
  if (!perms.length) return "Role defaults";
  if (perms.includes(SUPER_ACCESS_GRANT)) return "Super access (all permissions)";

  if (perms.length <= 3) {
    return perms.map(formatGrantLabel).join(", ");
  }

  return `${perms.length} custom permissions`;
};

export const formatPermsDetail = (perms: string[] = []): string[] => {
  if (!perms.length) return ["Role defaults"];
  if (perms.includes(SUPER_ACCESS_GRANT)) {
    return ["Super access (all permissions)"];
  }
  return perms.map(formatGrantLabel);
};
