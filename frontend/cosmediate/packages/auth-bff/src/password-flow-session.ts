import type { NextRequest } from "next/server";
import { getOrigin, readClientSessionSnapshot } from "@cosmediate/config";
import { getAuthMeMethodsApi } from "@cosmediate/api";

/**
 * Credentials for IdP password proxies (`set-password` / `update-password`).
 * Resolves email via `GET /auth/me/methods` using `cos_*` session snapshot.
 */
export async function getPasswordFlowCredentials(
  request: NextRequest,
): Promise<{ email: string; userId: string; accessToken: string } | null> {
  const get = (name: string) => request.cookies.get(name)?.value;
  const snap = readClientSessionSnapshot(get);

  if (!snap?.tokens.accessToken) return null;

  let origin: string;
  try {
    origin = getOrigin(request);
  } catch {
    return null;
  }

  const methods = await getAuthMeMethodsApi(snap.tokens.accessToken, {
    origin,
  });

  if (!methods.success || !methods.email) return null;

  return {
    email: methods.email,
    userId: snap.identityId,
    accessToken: snap.tokens.accessToken,
  };
}
