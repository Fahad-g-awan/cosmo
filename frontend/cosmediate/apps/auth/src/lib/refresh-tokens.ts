import type { UserRole } from "@cosmediate/type-utils";

export type RefreshBackendFailureCode =
  | "refresh_revoked"
  | "refresh_unavailable"
  | "invalid_session"
  | "invalid_response";

export type RefreshBackendSuccess = {
  accessToken: string;
  expiresAt: number;
  refreshTokenExpiresAt: number;
  sessionId: string;
  identityId: string;
  profileId: string | null;
  role: UserRole;
};

export type RefreshBackendResult =
  | { ok: true; data: RefreshBackendSuccess }
  | { ok: false; code: RefreshBackendFailureCode };

export type RefreshBackendParams = {
  sessionId: string;
  accessToken: string;
  origin: string;
};

const TRAIL = /\/+$/;
const REFRESH_PATH = "/auth/tokens/refresh";

function backendBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!raw) return null;
  return raw.replace(TRAIL, "");
}

function parseIdentityFields(
  o: Record<string, unknown>,
): Pick<RefreshBackendSuccess, "identityId" | "profileId" | "role"> | null {
  const identityId = o.identityId;
  const profileIdRaw = o.profileId;
  const role = o.role;

  if (typeof identityId !== "string" || typeof role !== "string") {
    return null;
  }

  const profileId =
    typeof profileIdRaw === "string"
      ? profileIdRaw || null
      : profileIdRaw === null
        ? null
        : null;

  return {
    identityId,
    profileId,
    role: role as UserRole,
  };
}

function parseSuccessBody(json: unknown): RefreshBackendSuccess | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;

  if (o.success === false) return null;

  const nested = o.data as Record<string, unknown> | undefined;
  if (
    nested &&
    typeof nested === "object" &&
    nested.tokens &&
    typeof nested.tokens === "object"
  ) {
    const t = nested.tokens as Record<string, unknown>;
    const accessToken = t.accessToken;
    const expiresAt = t.accessTokenExpiresAt ?? t.expiresAt;
    const refreshTokenExpiresAt = t.refreshTokenExpiresAt;
    const sessionId = o.sessionId ?? nested.sessionId;
    const identity = parseIdentityFields(o) ?? parseIdentityFields(nested);
    if (
      typeof accessToken === "string" &&
      typeof expiresAt === "number" &&
      typeof refreshTokenExpiresAt === "number" &&
      typeof sessionId === "string" &&
      identity
    ) {
      return {
        accessToken,
        expiresAt,
        refreshTokenExpiresAt,
        sessionId,
        ...identity,
      };
    }
  }

  const accessToken = o.accessToken;
  const expiresAt = o.accessTokenExpiresAt ?? o.expiresAt;
  const refreshTokenExpiresAt = o.refreshTokenExpiresAt;
  const sessionId = o.sessionId;
  const identity = parseIdentityFields(o);
  if (
    typeof accessToken !== "string" ||
    typeof expiresAt !== "number" ||
    typeof refreshTokenExpiresAt !== "number" ||
    typeof sessionId !== "string" ||
    !identity
  ) {
    return null;
  }

  return {
    accessToken,
    expiresAt,
    refreshTokenExpiresAt,
    sessionId,
    ...identity,
  };
}

function inferFailureCode(
  status: number,
  json: unknown,
): RefreshBackendFailureCode {
  if (status >= 500) return "refresh_unavailable";
  if (!json || typeof json !== "object") return "refresh_revoked";
  const err = (json as Record<string, unknown>).error;
  if (err === "invalid_session") return "invalid_session";
  if (err === "refresh_revoked") return "refresh_revoked";
  return "refresh_revoked";
}

/**
 * Calls backend `POST /auth/tokens/refresh`.
 * Backend expects `session_id` cookie, `Authorization: Bearer`, and allowed `Origin`.
 */
export async function refreshTokensFromBackend({
  sessionId,
  accessToken,
  origin,
}: RefreshBackendParams): Promise<RefreshBackendResult> {
  const base = backendBaseUrl();
  if (!base) {
    console.error(
      "[refreshTokensFromBackend] NEXT_PUBLIC_BACKEND_URL is not set",
    );
    return { ok: false, code: "refresh_unavailable" };
  }

  try {
    const res = await fetch(`${base}${REFRESH_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Cookie: `session_id=${encodeURIComponent(sessionId)}`,
        Origin: origin,
      },
    });

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, code: inferFailureCode(res.status, json) };
    }

    const parsed = parseSuccessBody(json);
    if (!parsed) {
      return { ok: false, code: "invalid_response" };
    }

    return { ok: true, data: parsed };
  } catch (err) {
    console.error("[refreshTokensFromBackend] request failed", err);
    return { ok: false, code: "refresh_unavailable" };
  }
}
