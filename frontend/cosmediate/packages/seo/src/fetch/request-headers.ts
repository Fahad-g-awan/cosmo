import { getOriginFromHeaders } from "@cosmediate/config";
import { headers } from "next/headers";

/**
 * Backend API routes require a whitelisted Origin header.
 */
export async function buildBackendRequestHeaders(
  extra: Record<string, string> = {},
): Promise<Record<string, string>> {
  const headerStore = await headers();
  const origin = getOriginFromHeaders(headerStore);

  return {
    Accept: "application/json",
    Origin: origin,
    ...extra,
  };
}
