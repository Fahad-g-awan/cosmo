import { useTranslations } from "@cosmediate/i18n/client";

interface UseSocialAccountsSignin {
  handleSocialAuth: (
    provider: "google" | "facebook" | "apple",
    mode: "manual" | "auto",
  ) => void;
}

export function buildGoogleHostedUiAuthorizeUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_COGNITO_OAUTH_REDIRECT_URI;
  const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "";
  const cognitoOauthPath = process.env.NEXT_PUBLIC_COGNITO_OAUTH_PATH || "";

  if (!clientId || !redirectUri || !cognitoDomain || !cognitoOauthPath) {
    throw new Error("Something went wrong, please try again");
  }

  const params = new URLSearchParams();
  params.set("response_type", "code");
  params.set("client_id", clientId);
  params.set("redirect_uri", redirectUri);
  params.set("scope", "openid email profile aws.cognito.signin.user.admin");
  params.set("identity_provider", "Google");
  params.set("prompt", "select_account");

  return `${cognitoDomain}${cognitoOauthPath}?${params.toString()}`;
}

export function useSocialAccountsSignin(): UseSocialAccountsSignin {
  const auth = useTranslations("auth");

  const handleSocialAuth = async (
    provider: "google" | "facebook" | "apple",
    mode: "manual" | "auto",
  ) => {
    try {
      localStorage.setItem("socialAuthmode", mode);
      localStorage.setItem("socialAuthProvider", provider);

      switch (provider) {
        case "google":
          await handleGoogleLogin(mode);
          break;
        case "facebook":
          await handleFacebookLogin(mode);
          break;
        case "apple":
          await handleAppleLogin(mode);
          break;
      }
    } catch (error) {
      console.log(
        "[useSocialAccountsSignin] Error in handleSocialAuth:",
        error,
      );
      throw new Error(error as string);
    }
  };

  const handleGoogleLogin = async (_mode: "manual" | "auto") => {
    try {
      window.location.href = buildGoogleHostedUiAuthorizeUrl();
    } catch (error) {
      console.log("[useSocialAccountsSignin] Google login error:", error);
      throw new Error(auth.social.genericError);
    }
  };

  // TODO(phase-13): Facebook login via Cognito Hosted UI.
  // Stub kept so the UI component signature is stable. Master plan P9-3.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFacebookLogin = async (mode: "manual" | "auto") => {};

  // TODO(phase-13): Apple login via Cognito Hosted UI. Master plan P9-4.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAppleLogin = async (mode: "manual" | "auto") => {};

  return {
    handleSocialAuth,
  };
}
