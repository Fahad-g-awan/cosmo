import type { ReviewReplyAuthorRole } from "@cosmediate/api";
import type { UserRole } from "@cosmediate/type-utils";

export const resolveReplyAuthorRole = (
  role: UserRole | null,
): ReviewReplyAuthorRole => {
  if (role === "MANAGER") return "CLINIC";
  if (role === "SPECIALIST") return "SPECIALIST";
  if (role === "ADMIN") return "ADMIN";
  return "CLINIC";
};
