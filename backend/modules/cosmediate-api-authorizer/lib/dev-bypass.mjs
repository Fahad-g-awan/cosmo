import { normalizePermList } from "/opt/nodejs/config/auth/super-access.mjs";
import { allow } from "./utils.mjs";

/**
 * Dev-only stub when AUTHORIZER_DEV_BYPASS=true (not for production).
 * @returns {ReturnType<allow> | null}
 */
export function tryDevBypass() {
  if (process.env.AUTHORIZER_DEV_BYPASS !== "true") return null;

  console.warn(
    "[authorizer] AUTHORIZER_DEV_BYPASS=true — using stub context (not for production)",
  );

  const perms = normalizePermList(
    process.env.AUTHORIZER_DEV_PERMS || "",
  ).join(" ");

  return allow({
    context: {
      identityId: "test",
      cognitoSub: "test",
      email: "test@dev.local",
      role: "ADMIN",
      entityId: "test",
      perms,
    },
    headers: {},
    message: "Authorized",
  });
}
