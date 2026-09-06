import type { AuthMessages } from "./types";

export const enAuth: AuthMessages = {
  pages: {
    signin: { title: "Sign in to your Account" },
    signup: { title: "Register new account" },
    forgotPassword: {
      title: "Forget Passward?",
      subtitle:
        "Enter your email address and we'll send you a link to reset your password.",
    },
    resetPassword: {
      title: "Create new password",
      subtitle:
        "Your new password must be different from previous used passwords",
    },
    confirmSignup: {
      title: "Verify Your Email",
      subtitle: "Please enter the verification code sent to your email",
    },
  },
  labels: {
    email: "Email",
    password: "Password",
    firstName: "First Name",
    lastName: "Last Name",
    verificationCode: "Verification Code",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
  },
  placeholders: {
    email: "Email",
    password: "Password",
    firstName: "First Name",
    lastName: "Last Name",
    enterEmail: "Enter Email",
    verificationCode: "Enter Verification Code",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    resetCode: "Enter reset code",
  },
  buttons: {
    signIn: "Sign In",
    registerNow: "Register Now",
    sendResetCode: "Send Reset Code",
    backToLogin: "Back to login",
    verifyEmail: "Verify Email",
    resetPassword: "Reset Password",
    tryAgain: "Try Again",
    backToSignIn: "Back to sign in",
    resendCode: "Resend code",
    resendIn: (seconds) => `Resend in ${seconds}s`,
    sending: "Sending...",
  },
  links: {
    forgotPassword: "Forget password?",
  },
  dividers: {
    orUse: "Or Use",
  },
  banners: {
    passwordSet: {
      title: "Password set",
      message:
        "Your password was set successfully. Please sign in with your email and new password.",
    },
    passwordUpdated: {
      title: "Password updated",
      message:
        "Your password was updated successfully. Please sign in with your new password.",
    },
  },
  validation: {
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    emailInvalid: "Please enter valid email",
    passwordInvalid: "Please enter valid password",
    firstNameInvalid: "Please enter valid first name",
    lastNameInvalid: "Please enter valid last name",
    codeRequired: "Please enter verification code",
    codeMinLength:
      "Verification code is required and must be at least 6 characters.",
    passwordMinLength: "Password must be at least 8 characters long.",
    passwordPolicy:
      "Password must contain uppercase, lowercase, number, and special character",
    passwordsMismatch: "Passwords do not match.",
  },
  toasts: {
    verificationSent: "Verification code sent to your email",
    emailVerified: "Email verified successfully",
    emailVerifiedSignIn: "Email verified",
    emailVerifiedSignInHint: "Please sign in to continue.",
    resetCodeSent: "Reset code sent to your email!",
    resetCodeResent: "Reset code sent",
    resetCodeResentHint: "Please check your email.",
    resendSuccess: "Verification code sent",
    resendSuccessHint: "Please check your email for verification code.",
    resendFailed: "Could not resend code",
    resendFailedHint: "Please try again in a moment.",
    passwordResetSuccess: "Password reset successfully",
    genericError: "Something went wrong, please try again",
    fixValidationErrors: "Please fix the validation errors",
    fixHighlightedFields: "Please fix the highlighted fields",
  },
  confirmSignup: {
    didntGetCode: "Didn't get a code?",
    tooManyAttempts:
      "Too many attempts. Please wait a while before requesting another code.",
  },
  resetPassword: {
    successTitle: "Password reset successful!",
    successMessage: "Your password has been successfully updated.",
    rejectTitle: "Password reset failed",
    rejectMessage: "We couldn't reset your password. Please try again.",
    confirmPasswordLabel: "Confirm password",
  },
  processing: {
    completing: "Completing sign-in…",
    connectingGoogle: "Connecting your Google account…",
    finishingConnection: "Finishing account connection…",
    finishingSignIn: "Finishing sign-in…",
    failedTitle: "Sign-in failed",
    linkFailedTitle: "Account linking failed",
    backToSignIn: "Back to sign in",
    backToDashboard: "Back to dashboard",
    linkGoogleFailed: "Could not connect your Google account. Please try again.",
    completeSignInFailed: "Could not complete sign-in. Please try again.",
    oauthErrorFallback:
      "Something went wrong during sign-in. Please try again.",
    emailMismatch:
      "The Google account email does not match your signed-in account. Use the Google account with the same email address.",
    accountUnavailable:
      "This account is unavailable. Please contact support.",
    messages: {
      unknown:
        "Something went wrong while signing you in. Please try again.",
      missing_auth_code:
        "The federated sign-in link is incomplete. Please try again.",
      token_exchange_failed:
        "We couldn't verify your sign-in. Please try again.",
      server_misconfig:
        "Sign-in is temporarily unavailable due to a server configuration issue. Please contact support.",
      server_error:
        "An unexpected error occurred. Please try again in a moment.",
      invalid_request:
        "The sign-in request was invalid. Please start again from the sign-in page.",
      invalid_grant:
        "The sign-in request was invalid. Please start again from the sign-in page.",
      invalid_client:
        "The sign-in request was invalid. Please start again from the sign-in page.",
      unsupported_grant_type:
        "The sign-in request was invalid. Please start again from the sign-in page.",
      not_authenticated:
        "Your session is no longer valid. Please sign in again.",
      invalid_session:
        "Your session is no longer valid. Please sign in again.",
      refresh_unavailable:
        "Your session has expired. Please sign in again.",
      refresh_revoked:
        "Your session has expired. Please sign in again.",
    },
  },
  social: {
    connected: "Connected",
    genericError: "Something went wrong, please try again",
    settingsHeading: "Connected accounts",
    linkGoogle: "Link Google",
  },
  chrome: {
    backgroundAlt: "Background",
  },
  errors: {
    supportHint: "If you believe this is a mistake, please contact support.",
    genericDescription: "Something went wrong, please try again.",
    validationFailed: "Validation error",
    passwordPolicy:
      "Password must contain uppercase, lowercase, number, and special character",
    accountBlockedTitle: "Your account is blocked",
    accountBlockedDescription: "Please contact support for help.",
    accountUnavailableTitle: "This account is unavailable",
    accountUnavailableDescription: "Please contact support.",
    accountUnverifiedTitle: "Account not verified",
    accountUnverifiedDescription:
      "Please verify your email before signing in. Check your inbox for a verification code, or request a new one from sign-up.",
    incorrectCurrentPassword: "Current password is incorrect",
    emailMismatch:
      "The Google account email does not match your signed-in account. Use the Google account with the same email address.",
    signin: {
      accountNotFound: "Account does not exist with this email",
      pleaseSignUp: "Please sign up",
      invalidCredentials:
        "Incorrect email or password, please try again.",
      invalidEmail: "Please enter a valid email",
    },
    signup: {
      invalidFirstName: "Please enter a valid first name",
      invalidLastName: "Please enter a valid last name",
      emailExists: "An account already exists with this email",
      pleaseSignIn: "Please sign in",
      invalidEmail: "Please enter a valid email",
    },
    confirmSignup: {
      accountNotFound: "Account does not exist with the given email",
      accountNotFoundToast: "Account does not exist with the given email",
      alreadyVerified: "This email is already verified",
      alreadyVerifiedToast: "Please sign in to access your account.",
      pleaseSignIn: "Please sign in",
      invalidCode: "Invalid verification code provided, please try again",
      invalidCodeToast: "Invalid verification code",
      tryAgain: "Please try again.",
      sessionExpired: "Verification session expired",
      sessionExpiredToast: "Verification session expired",
      sessionExpiredHint:
        "Please sign up again to receive a new verification code.",
    },
    forgotPassword: {
      oauthOnly:
        "You signed up with a social account. Please sign in with Google instead, or set a password from your account security settings.",
      socialOnly:
        "Please sign in with your social account instead of resetting a password.",
      accountNotFound: "Account does not exist with this email",
      pleaseSignUp: "Please sign up",
      blocked: "Unauthorized access: your account is blocked",
      invalidEmail: "Please enter a valid email",
      processFailed: "Process failed",
      incorrectEmail: "Incorrect email, please enter a valid email.",
    },
    resetPassword: {
      accountNotFound: "Account does not exist, please sign up",
      pleaseSignUp: "Please sign up",
      verifyFirst: "Please verify your account first",
      blocked: "Unauthorized access: your account is blocked",
      invalidPassword: "Please enter a valid password",
      invalidPasswordToast: "Invalid password",
      invalidCode: "Invalid verification code",
      invalidCodeToast: "Invalid verification code",
      tryAgain: "Please try again.",
    },
    fallbacks: {
      signin: "Sign in failed",
      signup: "Sign up failed",
      confirmSignup: "Confirm sign up failed",
      confirmSignupField: "Something went wrong, please try again.",
      forgotPassword: "Process failed",
      resetPassword: "Password reset failed",
    },
  },
};
