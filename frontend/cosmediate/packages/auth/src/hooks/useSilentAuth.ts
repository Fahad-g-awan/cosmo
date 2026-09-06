"use client";

import { useEffect, useRef, useState } from "react";

import type {
  AuthMeMethodsResponse,
  Session,
  SessionTokens,
  SessionUser,
  UserRole,
} from "@cosmediate/type-utils";
import {
  DEFAULT_MAINTENANCE_MESSAGE,
  getAuthMeMethodsApi,
  getCurrentUserApi,
  getPublicSystemSettingsApi,
  isApiMaintenanceFailure,
  reportMaintenanceBlocked,
  type ApiFailureResponse,
} from "@cosmediate/api";

import {
  shouldProactivelyRefresh,
  tryRefreshSession,
} from "../lib/try-refresh-session";
import { subscribeSessionTokensUpdated } from "../lib/session-token-sync";
import { handleUnauthorizedAccess } from "../lib/handle-unauthorized-access";
import {
  isApiNetworkFailure,
  isBrowserOffline,
  isFetchNetworkError,
} from "../lib/is-network-error";
import { toSessionUser } from "../lib/to-session-user";

export interface UseSilentAuthResult {
  isSessionLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  isAuthContextAvailable: boolean;
  authMethods: AuthMeMethodsResponse | null;
  identityId: string | null;
}

const SESSION_CHECK_INTERVAL_MS = 60 * 1000;
const RETRY_DELAY_MS = 500;
const MAX_RETRIES = 3;

type SessionResponse = {
  authenticated: boolean;
  session: {
    sessionId: string;
    identityId: string;
    profileId: string | null;
    userRole: UserRole;
    tokens: SessionTokens;
  } | null;
};

type FetchSessionResult =
  | { kind: "success"; data: SessionResponse }
  | { kind: "unauthenticated" }
  | { kind: "network_error" };

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function clientOrigin(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}

export const useSilentAuth = (): UseSilentAuthResult => {
  const [isAuthContextAvailable] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authMethods, setAuthMethods] = useState<AuthMeMethodsResponse | null>(
    null,
  );
  const [identityId, setIdentityId] = useState<string | null>(null);
  const hasAuthenticatedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const unsubscribeTokens = subscribeSessionTokensUpdated((snapshot) => {
      if (cancelled) return;
      setSession((prev) => {
        if (!prev) {
          return {
            sessionId: snapshot.sessionId,
            identityId: snapshot.identityId,
            profileId: snapshot.profileId,
            userRole: snapshot.userRole,
            tokens: snapshot.tokens,
          };
        }
        return {
          ...prev,
          sessionId: snapshot.sessionId,
          identityId: snapshot.identityId,
          profileId: snapshot.profileId,
          userRole: snapshot.userRole,
          tokens: snapshot.tokens,
        };
      });
    });

    const markUnauthenticated = () => {
      if (cancelled) return;
      hasAuthenticatedRef.current = false;
      setIsAuthenticated(false);
      setSession(null);
      setAuthMethods(null);
      setIdentityId(null);
    };

    const fetchSession = async (
      retryCount = 0,
    ): Promise<FetchSessionResult> => {
      if (isBrowserOffline()) {
        return { kind: "network_error" };
      }

      try {
        const res = await fetch("/api/auth/get-session", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status >= 500) {
            console.warn(
              "[useSilentAuth] session endpoint unavailable",
              res.status,
            );
            return { kind: "network_error" };
          }

          console.warn(
            "[useSilentAuth] session endpoint returned error",
            res.status,
          );
          return { kind: "unauthenticated" };
        }

        const data = (await res.json()) as SessionResponse;
        if (!data.authenticated || !data.session) {
          return { kind: "unauthenticated" };
        }

        return { kind: "success", data };
      } catch (err) {
        console.error("[useSilentAuth] network error fetching session", err);
        if (retryCount < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS);
          return fetchSession(retryCount + 1);
        }
        return { kind: "network_error" };
      }
    };

    const hydrateProfile = async (
      accessToken: string,
      sessionId: string,
      cookieIdentityId: string,
      profileId: string | null,
      userRole: UserRole,
      tokens: SessionTokens,
      allowRefreshRetry: boolean,
    ): Promise<
      "authenticated" | "network_error" | "unauthorized" | "maintenance_blocked"
    > => {
      if (isBrowserOffline()) {
        console.warn("[useSilentAuth] profile hydration skipped (offline)");
        return "network_error";
      }

      const origin = clientOrigin();

      try {
        const [me, methods] = await Promise.all([
          getCurrentUserApi(accessToken, origin ? { origin } : undefined),
          getAuthMeMethodsApi(accessToken, origin ? { origin } : undefined),
        ]);

        if (isApiNetworkFailure(me) || isApiNetworkFailure(methods)) {
          console.warn(
            "[useSilentAuth] profile hydration skipped (unreachable backend)",
          );
          return "network_error";
        }

        if (isApiMaintenanceFailure(me) || isApiMaintenanceFailure(methods)) {
          const maintenanceResponse = (
            isApiMaintenanceFailure(methods) ? methods : me
          ) as unknown as ApiFailureResponse;
          const maintenanceMessage =
            maintenanceResponse.message || DEFAULT_MAINTENANCE_MESSAGE;

          const publicSettings = await getPublicSystemSettingsApi();
          const allowAdminAccess =
            publicSettings.success && publicSettings.item
              ? publicSettings.item.maintenanceAllowAdminAccess
              : true;

          // Admin bypass only when maintenanceAllowAdminAccess is enabled.
          if (
            userRole === "ADMIN" &&
            allowAdminAccess &&
            me?.success &&
            me.profileReady &&
            me.profile
          ) {
            const sessionUser = toSessionUser(me);
            if (sessionUser) {
              if (cancelled) return "authenticated";

              hasAuthenticatedRef.current = true;
              setIdentityId(sessionUser.identityId);
              setAuthMethods(
                methods?.success ? methods : null,
              );
              setIsAuthenticated(true);
              setSession({
                sessionId,
                identityId: sessionUser.identityId,
                profileId: sessionUser.profileId,
                userRole,
                tokens,
                user: sessionUser,
              });
              return "authenticated";
            }
          }

          if (me?.success && me.profileReady && me.profile) {
            const sessionUser = toSessionUser(me);
            if (sessionUser) {
              if (cancelled) return "maintenance_blocked";

              hasAuthenticatedRef.current = true;
              setIdentityId(sessionUser.identityId);
              setAuthMethods(null);
              setIsAuthenticated(true);
              setSession({
                sessionId,
                identityId: sessionUser.identityId,
                profileId: sessionUser.profileId,
                userRole,
                tokens,
                user: sessionUser,
              });
              reportMaintenanceBlocked({ message: maintenanceMessage });
              return "maintenance_blocked";
            }
          }

          reportMaintenanceBlocked({ message: maintenanceMessage });
          return "maintenance_blocked";
        }

        if (
          !me?.success ||
          !me.profileReady ||
          !me.profile ||
          !methods?.success
        ) {
          if (allowRefreshRetry) {
            const refreshed = await tryRefreshSession();
            if (refreshed.ok) {
              const refreshedSession = await fetchSession();
              if (refreshedSession.kind === "network_error") {
                return "network_error";
              }
              if (refreshedSession.kind === "success") {
                const s = refreshedSession.data.session!;
                return hydrateProfile(
                  s.tokens.accessToken,
                  s.sessionId,
                  s.identityId,
                  s.profileId,
                  s.userRole,
                  s.tokens,
                  false,
                );
              }
            } else if (refreshed.reason === "network") {
              return "network_error";
            }
          }

          console.warn(
            "[useSilentAuth] profile not ready or missing — unauthorized access",
          );
          await handleUnauthorizedAccess(accessToken);
          return "unauthorized";
        }

        if (cancelled) return "unauthorized";

        const sessionUser = toSessionUser(me);
        if (!sessionUser) {
          console.warn(
            "[useSilentAuth] failed to map session user — unauthorized access",
          );
          await handleUnauthorizedAccess(accessToken);
          return "unauthorized";
        }

        if (cancelled) return "unauthorized";

        hasAuthenticatedRef.current = true;
        setIdentityId(sessionUser.identityId);
        setAuthMethods(methods);
        setIsAuthenticated(true);
        setSession({
          sessionId,
          identityId: sessionUser.identityId,
          profileId: sessionUser.profileId,
          userRole,
          tokens,
          user: sessionUser,
        });
        return "authenticated";
      } catch (err) {
        if (isFetchNetworkError(err)) {
          console.warn(
            "[useSilentAuth] profile hydration skipped (network error)",
            err,
          );
          return "network_error";
        }

        if (allowRefreshRetry) {
          const refreshed = await tryRefreshSession();
          if (refreshed.ok) {
            const refreshedSession = await fetchSession();
            if (refreshedSession.kind === "network_error") {
              return "network_error";
            }
            if (refreshedSession.kind === "success") {
              const s = refreshedSession.data.session!;
              return hydrateProfile(
                s.tokens.accessToken,
                s.sessionId,
                s.identityId,
                s.profileId,
                s.userRole,
                s.tokens,
                false,
              );
            }
          } else if (refreshed.reason === "network") {
            return "network_error";
          }
        }

        console.error("[useSilentAuth] profile hydration failed", err);
        await handleUnauthorizedAccess(accessToken);
        return "unauthorized";
      }
    };

    const run = async (showLoading: boolean) => {
      if (cancelled) return;

      if (isBrowserOffline() && hasAuthenticatedRef.current) {
        console.warn("[useSilentAuth] offline — preserving authenticated session");
        return;
      }

      if (showLoading) setIsSessionLoading(true);

      try {
        let sessionResult = await fetchSession();

        if (cancelled) return;

        if (sessionResult.kind === "network_error") {
          if (hasAuthenticatedRef.current) {
            console.warn(
              "[useSilentAuth] session check skipped (offline/unreachable)",
            );
          }
          return;
        }

        if (sessionResult.kind === "unauthenticated") {
          markUnauthenticated();
          return;
        }

        let data = sessionResult.data;

        if (shouldProactivelyRefresh(data.session!.tokens)) {
          const refreshed = await tryRefreshSession();
          if (refreshed.ok) {
            sessionResult = await fetchSession();
            if (cancelled) return;

            if (sessionResult.kind === "network_error") {
              if (hasAuthenticatedRef.current) return;
              return;
            }

            if (sessionResult.kind === "unauthenticated") {
              markUnauthenticated();
              return;
            }

            data = sessionResult.data;
          } else if (refreshed.reason === "network") {
            if (hasAuthenticatedRef.current) {
              console.warn(
                "[useSilentAuth] proactive refresh skipped (offline/unreachable)",
              );
              return;
            }
          } else {
            console.warn(
              "[useSilentAuth] proactive refresh rejected — clearing session",
            );
            await handleUnauthorizedAccess(data.session!.tokens?.accessToken);
            markUnauthenticated();
            return;
          }
        }

        const {
          sessionId,
          identityId: cookieIdentityId,
          profileId,
          userRole,
          tokens,
        } = data.session!;
        const accessToken = tokens?.accessToken;

        if (!cookieIdentityId || !userRole || !accessToken) {
          console.warn(
            "[useSilentAuth] authenticated session missing identity fields — unauthorized access",
          );
          await handleUnauthorizedAccess(accessToken);
          return;
        }

        const hydrationResult = await hydrateProfile(
          accessToken,
          sessionId,
          cookieIdentityId,
          profileId,
          userRole,
          tokens,
          true,
        );

        if (hydrationResult === "network_error" && hasAuthenticatedRef.current) {
          return;
        }

        if (hydrationResult === "maintenance_blocked") {
          return;
        }
      } finally {
        if (!cancelled && showLoading) setIsSessionLoading(false);
      }
    };

    void run(true);

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        void run(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onOnline = () => {
      if (!cancelled) {
        void run(false);
      }
    };
    window.addEventListener("online", onOnline);

    const sessionCheck = setInterval(() => {
      if (!cancelled) void run(false);
    }, SESSION_CHECK_INTERVAL_MS);

    let heartbeat: ReturnType<typeof setInterval> | undefined;

    if (process.env.NEXT_PUBLIC_AUTH_HEARTBEAT === "true") {
      heartbeat = setInterval(
        () => {
          if (!cancelled) void run(false);
        },
        5 * 60 * 1000,
      );
    }

    return () => {
      cancelled = true;
      unsubscribeTokens();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      clearInterval(sessionCheck);
      if (heartbeat) clearInterval(heartbeat);
    };
  }, []);

  return {
    isSessionLoading,
    isAuthenticated,
    session,
    isAuthContextAvailable,
    authMethods,
    identityId,
  };
};
