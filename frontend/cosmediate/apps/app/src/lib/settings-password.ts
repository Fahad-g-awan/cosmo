import { buildAuthClearSessionUrlClient } from "@cosmediate/config";

import type { ApiFailureLike } from "@app/lib/api-errors";

export async function logoutAndRedirectToAuthSignin(
  accessToken: string | undefined,
  success: "password_set" | "password_updated",
) {
  try {
    if (accessToken) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ access_token: accessToken }),
      });
    }
  } catch {
    // Proceed to clear-session regardless.
  }

  window.location.href = buildAuthClearSessionUrlClient(success);
}

interface PasswordSubmitValues {
  oldPassword?: string;
  newPassword: string;
}

interface PasswordSubmitOptions {
  accessToken: string;
  userHasPassword: boolean;
  values: PasswordSubmitValues;
}

export type PasswordSubmitResult =
  | { ok: true; action: "password_set" | "password_updated" }
  | ({ ok: false } & ApiFailureLike);

function normalizePasswordFailure(
  data: {
    message?: string;
    error?: string;
    details?: string[] | null;
  } | null,
  fallback: string,
): ApiFailureLike {
  let details = Array.isArray(data?.details)
    ? data.details.filter(
        (d): d is string => typeof d === "string" && d.trim().length > 0,
      )
    : null;

  // Map domain code onto a field path so FormApiRef can highlight Current Password.
  if (data?.error === "incorrect_password" && (!details || details.length === 0)) {
    details = ["/oldPassword Current password is incorrect"];
  } else if (data?.error === "incorrect_password" && details) {
    const hasPath = details.some((d) => d.trim().startsWith("/"));
    if (!hasPath) {
      details = [`/oldPassword ${details[0]}`];
    }
  }

  const message =
    (typeof data?.message === "string" && data.message.trim()) ||
    (details?.[0] ?? fallback);

  return {
    success: false,
    error: data?.error,
    message,
    details,
  };
}

export async function submitSettingsPassword({
  accessToken,
  userHasPassword,
  values,
}: PasswordSubmitOptions): Promise<PasswordSubmitResult> {
  if (userHasPassword) {
    const response = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        oldPassword: values.oldPassword || "",
        newPassword: values.newPassword,
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
      error?: string;
      details?: string[] | null;
    } | null;

    if (response.ok && data?.success) {
      return { ok: true, action: "password_updated" };
    }

    return {
      ok: false,
      ...normalizePasswordFailure(data, "Failed to update password"),
    };
  }

  const response = await fetch("/api/auth/set-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      password: values.newPassword,
    }),
  });

  const data = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    error?: string;
    details?: string[] | null;
  } | null;

  if (response.ok && data?.success) {
    return { ok: true, action: "password_set" };
  }

  return {
    ok: false,
    ...normalizePasswordFailure(data, "Failed to set password"),
  };
}
