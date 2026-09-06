import api from "../axiosInstance";

import { handleApiError, logApiResponse } from "../lib/utils";
import type {
  BackendOriginOptions,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  LogoutResponse,
  setNewPasswordRequest,
  setNewPasswordResponse,
  ResendSignupCodeRequest,
  ResendSignupCodeResponse,
  ResendForgotPasswordCodeRequest,
  ResendForgotPasswordCodeResponse,
  GetCurrentUserResponse,
  GetAuthMeMethodsResponse,
  OAuthLinkCallbackRequest,
  OAuthLinkCallbackResponse,
  OAuthLinkStartRequest,
  OAuthLinkStartResponse,
} from "../types/auth.types";

function originHeaders(
  options?: BackendOriginOptions,
): Record<string, string> | undefined {
  return options?.origin ? { Origin: options.origin } : undefined;
}

function authHeaders(
  accessToken: string,
  options?: BackendOriginOptions,
): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...(options?.origin ? { Origin: options.origin } : {}),
  };
}

export const userSignInApi = async (
  data: SignInRequest,
  options?: BackendOriginOptions,
): Promise<SignInResponse> => {
  try {
    const response = await api.post<SignInResponse>("/auth/sign-in", data, {
      headers: originHeaders(options),
    });
    return logApiResponse("/auth/sign-in", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const userSignUpApi = async <T>(
  data: SignUpRequest,
  options?: BackendOriginOptions,
): Promise<SignUpResponse<T>> => {
  try {
    const response = await api.post<SignUpResponse<T>>("/auth/sign-up", data, {
      headers: originHeaders(options),
    });
    return logApiResponse("/auth/sign-up", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const userSignUpConfirmApi = async (
  data: VerifyEmailRequest,
  options?: BackendOriginOptions,
): Promise<VerifyEmailResponse> => {
  try {
    const response = await api.post<VerifyEmailResponse>(
      "/auth/confirm-signup",
      data,
      { headers: originHeaders(options) },
    );
    return logApiResponse("/auth/confirm-signup", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateUserPasswordApi = async (
  data: UpdatePasswordRequest,
  accessToken: string,
  options?: BackendOriginOptions,
): Promise<UpdatePasswordResponse> => {
  try {
    const response = await api.post<UpdatePasswordResponse>(
      "/auth/password/update",
      data,
      { headers: authHeaders(accessToken, options) },
    );
    return logApiResponse("/auth/password/update", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const setNewPasswordApi = async (
  data: setNewPasswordRequest,
  accessToken: string,
  options?: BackendOriginOptions,
): Promise<setNewPasswordResponse> => {
  try {
    const response = await api.post<setNewPasswordResponse>(
      "/auth/password/set-new",
      data,
      { headers: authHeaders(accessToken, options) },
    );
    return logApiResponse("/auth/password/set-new", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const forgotPasswordApi = async (
  data: ForgotPasswordRequest,
  options?: BackendOriginOptions,
): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>(
      "/auth/password/forgot",
      data,
      { headers: originHeaders(options) },
    );
    return logApiResponse("/auth/password/forgot", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const resendSignupCodeApi = async (
  data: ResendSignupCodeRequest,
  options?: BackendOriginOptions,
): Promise<ResendSignupCodeResponse> => {
  try {
    const response = await api.post<ResendSignupCodeResponse>(
      "/auth/confirm-signup/resend",
      data,
      { headers: originHeaders(options) },
    );
    return logApiResponse("/auth/confirm-signup/resend", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const resendForgotPasswordCodeApi = async (
  data: ResendForgotPasswordCodeRequest,
  options?: BackendOriginOptions,
): Promise<ResendForgotPasswordCodeResponse> => {
  try {
    const response = await api.post<ResendForgotPasswordCodeResponse>(
      "/auth/password/forgot/resend",
      data,
      { headers: originHeaders(options) },
    );
    return logApiResponse("/auth/password/forgot/resend", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const resetPasswordApi = async (
  data: ResetPasswordRequest,
  options?: BackendOriginOptions,
): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post<ResetPasswordResponse>(
      "/auth/password/reset",
      data,
      { headers: originHeaders(options) },
    );
    return logApiResponse("/auth/password/reset", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCurrentUserApi = async (
  accessToken: string,
  options?: BackendOriginOptions,
): Promise<GetCurrentUserResponse> => {
  try {
    const response = await api.get<GetCurrentUserResponse>("/auth/me", {
      headers: authHeaders(accessToken, options),
    });
    return logApiResponse("/auth/me [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const oauthLinkStartApi = async (
  data: OAuthLinkStartRequest,
  accessToken: string,
  options?: BackendOriginOptions,
): Promise<OAuthLinkStartResponse> => {
  try {
    const response = await api.post<OAuthLinkStartResponse>(
      "/auth/oauth/link/start",
      data,
      { headers: authHeaders(accessToken, options) },
    );
    return logApiResponse("/auth/oauth/link/start", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const oauthLinkCallbackApi = async (
  data: OAuthLinkCallbackRequest,
  accessToken: string,
  options?: BackendOriginOptions,
): Promise<OAuthLinkCallbackResponse> => {
  try {
    const response = await api.post<OAuthLinkCallbackResponse>(
      "/auth/oauth/link/callback",
      data,
      { headers: authHeaders(accessToken, options) },
    );
    return logApiResponse("/auth/oauth/link/callback", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAuthMeMethodsApi = async (
  accessToken: string,
  options?: BackendOriginOptions,
): Promise<GetAuthMeMethodsResponse> => {
  try {
    const response = await api.get<GetAuthMeMethodsResponse>(
      "/auth/me/methods",
      {
        headers: authHeaders(accessToken, options),
      },
    );
    return logApiResponse("/auth/me/methods [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const logoutApi = async ({
  accessToken,
  redirectUri,
  origin,
  sessionId,
}: {
  accessToken: string;
  redirectUri: string;
  origin?: string;
  sessionId?: string;
}): Promise<LogoutResponse> => {
  try {
    const headers = authHeaders(accessToken, origin ? { origin } : undefined);
    if (sessionId) {
      headers.Cookie = `session_id=${encodeURIComponent(sessionId)}`;
    }

    const response = await api.post<LogoutResponse>(
      "/auth/logout",
      { redirectUri },
      { headers },
    );

    return logApiResponse("/auth/logout", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
