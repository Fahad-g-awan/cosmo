"use client";

import { createContext, useReducer, ReactNode, useEffect } from "react";

import {
  AuthMeMethodsResponse,
  UserRole,
  Session,
  SessionUser,
} from "@cosmediate/type-utils";
import { getAuthClearSessionUrlClient } from "@cosmediate/config";

import { ensureApiUnauthorizedInterceptor } from "@auth-core/lib/api-unauthorized-interceptor";
import { useSilentAuth } from "@auth-core/hooks/useSilentAuth";

interface AppState {
  sessionUser: SessionUser | null;
  userRole: UserRole | null;
  session: Session | null;
  authMethods: AuthMeMethodsResponse | null;
  identityId: string | null;
  profileId: string | null;
}

interface AppAction {
  type: string;
  payload?:
    | SessionUser
    | UserRole
    | Session
    | AuthMeMethodsResponse
    | string
    | null;
}

export interface AuthContextType {
  handleLogout: () => void;
  handleSetSessionUser: (user?: SessionUser) => void;

  sessionUser: SessionUser | null;
  userRole: UserRole | null;
  session: Session | null;
  authMethods: AuthMeMethodsResponse | null;
  identityId: string | null;
  profileId: string | null;

  isSessionLoading: boolean;
  isAuthenticated: boolean;
  isAuthContextAvailable: boolean;
}

const initialState: AppState = {
  sessionUser: null,
  userRole: null,
  session: null,
  authMethods: null,
  identityId: null,
  profileId: null,
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_SESSION_USER":
      return {
        ...state,
        sessionUser: action.payload as SessionUser,
      };
    case "SET_USER_ROLE":
      return { ...state, userRole: action.payload as UserRole };
    case "SET_SESSION":
      return { ...state, session: action.payload as Session };
    case "SET_AUTH_METHODS":
      return {
        ...state,
        authMethods: action.payload as AuthMeMethodsResponse,
      };
    case "SET_IDENTITY_ID":
      return { ...state, identityId: action.payload as string };
    case "CLEAR_AUTH":
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

const AuthComp = (): AuthContextType => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    isSessionLoading,
    isAuthenticated,
    session,
    isAuthContextAvailable,
    authMethods,
    identityId,
  } = useSilentAuth();

  useEffect(() => {
    ensureApiUnauthorizedInterceptor();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !session) {
      dispatch({ type: "CLEAR_AUTH" });
      return;
    }

    dispatch({ type: "SET_SESSION", payload: session });

    if (session.userRole) {
      dispatch({ type: "SET_USER_ROLE", payload: session.userRole });
    }

    if (identityId) {
      dispatch({ type: "SET_IDENTITY_ID", payload: identityId });
    }

    if (authMethods) {
      dispatch({ type: "SET_AUTH_METHODS", payload: authMethods });
    }

    if (session.user) {
      dispatch({ type: "SET_SESSION_USER", payload: session.user });
    }
  }, [isAuthenticated, session, authMethods, identityId]);

  const handleLogout = async () => {
    const accessToken = session?.tokens?.accessToken;
    const clearSessionUrl = getAuthClearSessionUrlClient();

    try {
      if (accessToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ access_token: accessToken }),
        });
      }
    } catch (error) {
      console.error("[AuthProvider] /api/auth/logout failed", error);
    }

    window.location.href = clearSessionUrl;
  };

  const handleSetSessionUser = (user?: SessionUser) => {
    dispatch({ type: "SET_SESSION_USER", payload: user });
  };

  return {
    handleLogout,
    handleSetSessionUser,

    sessionUser: state.sessionUser,
    userRole: state.userRole,
    session: state.session,
    authMethods: state.authMethods,
    identityId: state.identityId,
    profileId: state.session?.profileId ?? state.sessionUser?.profileId ?? null,

    isSessionLoading,
    isAuthenticated,
    isAuthContextAvailable,
  };
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const appContext = AuthComp();

  return (
    <AuthContext.Provider value={appContext}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
