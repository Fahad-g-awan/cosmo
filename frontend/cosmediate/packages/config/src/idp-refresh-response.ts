import type { ScalarSessionCookiePayload } from "./auth-cookies";

/** Parses JSON from auth IdP `POST /api/auth/refresh` success body. */
export function parseIdpRefreshSuccessPayload(
  body: unknown,
): ScalarSessionCookiePayload | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (o.success !== true) return null;

  const session_id = o.session_id;
  const access_token = o.access_token;
  const token_exp = o.token_exp;
  const refresh_exp = o.refresh_exp;
  const identity_id = o.identity_id;
  const profile_id_raw = o.profile_id;
  const user_role = o.user_role;

  if (
    typeof session_id !== "string" ||
    typeof access_token !== "string" ||
    typeof identity_id !== "string" ||
    typeof user_role !== "string" ||
    (profile_id_raw !== undefined &&
      profile_id_raw !== null &&
      typeof profile_id_raw !== "string")
  ) {
    return null;
  }

  const profile_id =
    typeof profile_id_raw === "string"
      ? profile_id_raw
      : profile_id_raw === null
        ? ""
        : "";

  const te =
    typeof token_exp === "number"
      ? token_exp
      : typeof token_exp === "string"
        ? Number(token_exp)
        : NaN;
  const re =
    typeof refresh_exp === "number"
      ? refresh_exp
      : typeof refresh_exp === "string"
        ? Number(refresh_exp)
        : NaN;
  if (!Number.isFinite(te) || !Number.isFinite(re)) return null;

  return {
    session_id,
    access_token,
    token_exp: Math.trunc(te),
    refresh_exp: Math.trunc(re),
    identity_id,
    profile_id,
    user_role,
  };
}
