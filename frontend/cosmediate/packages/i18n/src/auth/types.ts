export type AuthProcessingErrorCode =
  | "invalid_request"
  | "invalid_grant"
  | "invalid_client"
  | "unsupported_grant_type"
  | "not_authenticated"
  | "invalid_session"
  | "missing_auth_code"
  | "token_exchange_failed"
  | "refresh_unavailable"
  | "refresh_revoked"
  | "server_misconfig"
  | "server_error"
  | "unknown";

export interface AuthMessages {
  pages: {
    signin: { title: string };
    signup: { title: string };
    forgotPassword: { title: string; subtitle: string };
    resetPassword: { title: string; subtitle: string };
    confirmSignup: { title: string; subtitle: string };
  };
  labels: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    verificationCode: string;
    newPassword: string;
    confirmPassword: string;
  };
  placeholders: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    enterEmail: string;
    verificationCode: string;
    newPassword: string;
    confirmPassword: string;
    resetCode: string;
  };
  buttons: {
    signIn: string;
    registerNow: string;
    sendResetCode: string;
    backToLogin: string;
    verifyEmail: string;
    resetPassword: string;
    tryAgain: string;
    backToSignIn: string;
    resendCode: string;
    resendIn: (seconds: number) => string;
    sending: string;
  };
  links: {
    forgotPassword: string;
  };
  dividers: {
    orUse: string;
  };
  banners: {
    passwordSet: { title: string; message: string };
    passwordUpdated: { title: string; message: string };
  };
  validation: {
    emailRequired: string;
    passwordRequired: string;
    emailInvalid: string;
    passwordInvalid: string;
    firstNameInvalid: string;
    lastNameInvalid: string;
    codeRequired: string;
    codeMinLength: string;
    passwordMinLength: string;
    passwordPolicy: string;
    passwordsMismatch: string;
  };
  toasts: {
    verificationSent: string;
    emailVerified: string;
    emailVerifiedSignIn: string;
    emailVerifiedSignInHint: string;
    resetCodeSent: string;
    resetCodeResent: string;
    resetCodeResentHint: string;
    resendSuccess: string;
    resendSuccessHint: string;
    resendFailed: string;
    resendFailedHint: string;
    passwordResetSuccess: string;
    genericError: string;
    fixValidationErrors: string;
    fixHighlightedFields: string;
  };
  confirmSignup: {
    didntGetCode: string;
    tooManyAttempts: string;
  };
  resetPassword: {
    successTitle: string;
    successMessage: string;
    rejectTitle: string;
    rejectMessage: string;
    confirmPasswordLabel: string;
  };
  processing: {
    completing: string;
    connectingGoogle: string;
    finishingConnection: string;
    finishingSignIn: string;
    failedTitle: string;
    linkFailedTitle: string;
    backToSignIn: string;
    backToDashboard: string;
    linkGoogleFailed: string;
    completeSignInFailed: string;
    oauthErrorFallback: string;
    emailMismatch: string;
    accountUnavailable: string;
    messages: Record<AuthProcessingErrorCode, string>;
  };
  social: {
    connected: string;
    genericError: string;
    settingsHeading: string;
    linkGoogle: string;
  };
  chrome: {
    backgroundAlt: string;
  };
  errors: {
    supportHint: string;
    genericDescription: string;
    validationFailed: string;
    passwordPolicy: string;
    accountBlockedTitle: string;
    accountBlockedDescription: string;
    accountUnavailableTitle: string;
    accountUnavailableDescription: string;
    accountUnverifiedTitle: string;
    accountUnverifiedDescription: string;
    incorrectCurrentPassword: string;
    emailMismatch: string;
    signin: {
      accountNotFound: string;
      pleaseSignUp: string;
      invalidCredentials: string;
      invalidEmail: string;
    };
    signup: {
      invalidFirstName: string;
      invalidLastName: string;
      emailExists: string;
      pleaseSignIn: string;
      invalidEmail: string;
    };
    confirmSignup: {
      accountNotFound: string;
      accountNotFoundToast: string;
      alreadyVerified: string;
      alreadyVerifiedToast: string;
      pleaseSignIn: string;
      invalidCode: string;
      invalidCodeToast: string;
      tryAgain: string;
      sessionExpired: string;
      sessionExpiredToast: string;
      sessionExpiredHint: string;
    };
    forgotPassword: {
      oauthOnly: string;
      socialOnly: string;
      accountNotFound: string;
      pleaseSignUp: string;
      blocked: string;
      invalidEmail: string;
      processFailed: string;
      incorrectEmail: string;
    };
    resetPassword: {
      accountNotFound: string;
      pleaseSignUp: string;
      verifyFirst: string;
      blocked: string;
      invalidPassword: string;
      invalidPasswordToast: string;
      invalidCode: string;
      invalidCodeToast: string;
      tryAgain: string;
    };
    fallbacks: {
      signin: string;
      signup: string;
      confirmSignup: string;
      confirmSignupField: string;
      forgotPassword: string;
      resetPassword: string;
    };
  };
}
