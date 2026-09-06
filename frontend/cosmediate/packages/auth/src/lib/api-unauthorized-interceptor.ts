import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { api } from "@cosmediate/api";

import { handleUnauthorizedAccess } from "./handle-unauthorized-access";
import {
  fetchAccessTokenFromSession,
  tryRefreshSession,
} from "./try-refresh-session";

let installed = false;

type RetriableAxiosConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function bearerFromAxiosConfig(config: unknown): string | undefined {
  if (!config || typeof config !== "object") return undefined;

  const { headers } = config as {
    headers?: Record<string, unknown> & {
      common?: Record<string, unknown>;
    };
  };

  if (!headers) return undefined;

  const raw =
    headers.Authorization ??
    headers.authorization ??
    headers.common?.Authorization;

  if (typeof raw !== "string") return undefined;
  return raw.startsWith("Bearer ") ? raw.slice("Bearer ".length) : raw;
}

/**
 * Registers a one-time axios **401** handler.
 * Must be called from the client — e.g. `AuthProvider`. Keeps **`@cosmediate/api`**
 * free of imports from **`@cosmediate/auth`**.
 */
export function ensureApiUnauthorizedInterceptor(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: unknown) => {
      const err = error as {
        response?: { status?: number };
        config?: RetriableAxiosConfig;
      };
      if (err?.response?.status !== 401) {
        throw error;
      }

      const requestUrl =
        typeof err.config?.url === "string" ? err.config.url : "";
      // Optional platform metadata — a 401 here must not tear down the session.
      if (
        requestUrl.includes("/platform/permissions/catalog") ||
        requestUrl.includes("/platform/navigation")
      ) {
        throw error;
      }

      const path =
        typeof window !== "undefined" ? window.location.pathname : "";
      if (path.startsWith("/auth/")) {
        throw error;
      }

      const token = bearerFromAxiosConfig(err.config);

      if (!err.config || err.config._retry) {
        await handleUnauthorizedAccess(token);
        throw error;
      }

      const refreshed = await tryRefreshSession();
      if (!refreshed.ok) {
        if (refreshed.reason === "network") {
          throw error;
        }
        await handleUnauthorizedAccess(token);
        throw error;
      }

      const newToken = await fetchAccessTokenFromSession();
      if (!newToken) {
        await handleUnauthorizedAccess(token);
        throw error;
      }

      err.config._retry = true;
      err.config.headers.Authorization = `Bearer ${newToken}`;
      return api.request(err.config);
    },
  );
}
