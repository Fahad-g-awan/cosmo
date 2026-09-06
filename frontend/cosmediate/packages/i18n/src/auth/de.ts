import type { AuthMessages } from "./types";

export const deAuth: AuthMessages = {
  pages: {
    signin: { title: "Bei Ihrem Konto anmelden" },
    signup: { title: "Neues Konto registrieren" },
    forgotPassword: {
      title: "Passwort vergessen?",
      subtitle:
        "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.",
    },
    resetPassword: {
      title: "Neues Passwort erstellen",
      subtitle:
        "Ihr neues Passwort muss sich von zuvor verwendeten Passwörtern unterscheiden",
    },
    confirmSignup: {
      title: "E-Mail verifizieren",
      subtitle:
        "Bitte geben Sie den an Ihre E-Mail gesendeten Verifizierungscode ein",
    },
  },
  labels: {
    email: "E-Mail",
    password: "Passwort",
    firstName: "Vorname",
    lastName: "Nachname",
    verificationCode: "Verifizierungscode",
    newPassword: "Neues Passwort",
    confirmPassword: "Passwort bestätigen",
  },
  placeholders: {
    email: "E-Mail",
    password: "Passwort",
    firstName: "Vorname",
    lastName: "Nachname",
    enterEmail: "E-Mail eingeben",
    verificationCode: "Verifizierungscode eingeben",
    newPassword: "Neues Passwort",
    confirmPassword: "Passwort bestätigen",
    resetCode: "Reset-Code eingeben",
  },
  buttons: {
    signIn: "Anmelden",
    registerNow: "Jetzt registrieren",
    sendResetCode: "Reset-Code senden",
    backToLogin: "Zurück zur Anmeldung",
    verifyEmail: "E-Mail verifizieren",
    resetPassword: "Passwort zurücksetzen",
    tryAgain: "Erneut versuchen",
    backToSignIn: "Zurück zur Anmeldung",
    resendCode: "Code erneut senden",
    resendIn: (seconds) => `Erneut senden in ${seconds}s`,
    sending: "Wird gesendet...",
  },
  links: {
    forgotPassword: "Passwort vergessen?",
  },
  dividers: {
    orUse: "Oder verwenden",
  },
  banners: {
    passwordSet: {
      title: "Passwort festgelegt",
      message:
        "Ihr Passwort wurde erfolgreich festgelegt. Bitte melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem neuen Passwort an.",
    },
    passwordUpdated: {
      title: "Passwort aktualisiert",
      message:
        "Ihr Passwort wurde erfolgreich aktualisiert. Bitte melden Sie sich mit Ihrem neuen Passwort an.",
    },
  },
  validation: {
    emailRequired: "E-Mail ist erforderlich",
    passwordRequired: "Passwort ist erforderlich",
    emailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    passwordInvalid: "Bitte geben Sie ein gültiges Passwort ein",
    firstNameInvalid: "Bitte geben Sie einen gültigen Vornamen ein",
    lastNameInvalid: "Bitte geben Sie einen gültigen Nachnamen ein",
    codeRequired: "Bitte geben Sie den Verifizierungscode ein",
    codeMinLength:
      "Der Verifizierungscode ist erforderlich und muss mindestens 6 Zeichen lang sein.",
    passwordMinLength: "Das Passwort muss mindestens 8 Zeichen lang sein.",
    passwordPolicy:
      "Password must contain uppercase, lowercase, number, and special character",
    passwordsMismatch: "Die Passwörter stimmen nicht überein.",
  },
  toasts: {
    verificationSent: "Verifizierungscode an Ihre E-Mail gesendet",
    emailVerified: "E-Mail erfolgreich verifiziert",
    emailVerifiedSignIn: "E-Mail verifiziert",
    emailVerifiedSignInHint: "Bitte melden Sie sich an, um fortzufahren.",
    resetCodeSent: "Reset-Code an Ihre E-Mail gesendet!",
    resetCodeResent: "Reset-Code gesendet",
    resetCodeResentHint: "Bitte überprüfen Sie Ihre E-Mail.",
    resendSuccess: "Verifizierungscode gesendet",
    resendSuccessHint:
      "Bitte überprüfen Sie Ihre E-Mail auf den Verifizierungscode.",
    resendFailed: "Code konnte nicht erneut gesendet werden",
    resendFailedHint: "Bitte versuchen Sie es in einem Moment erneut.",
    passwordResetSuccess: "Passwort erfolgreich zurückgesetzt",
    genericError: "Etwas ist schiefgelaufen, bitte versuchen Sie es erneut",
    fixValidationErrors: "Please fix the validation errors",
    fixHighlightedFields: "Please fix the highlighted fields",
  },
  confirmSignup: {
    didntGetCode: "Keinen Code erhalten?",
    tooManyAttempts:
      "Zu viele Versuche. Bitte warten Sie eine Weile, bevor Sie einen weiteren Code anfordern.",
  },
  resetPassword: {
    successTitle: "Passwort erfolgreich zurückgesetzt!",
    successMessage: "Ihr Passwort wurde erfolgreich aktualisiert.",
    rejectTitle: "Passwort zurücksetzen fehlgeschlagen",
    rejectMessage:
      "Wir konnten Ihr Passwort nicht zurücksetzen. Bitte versuchen Sie es erneut.",
    confirmPasswordLabel: "Passwort bestätigen",
  },
  processing: {
    completing: "Anmeldung wird abgeschlossen…",
    connectingGoogle: "Ihr Google-Konto wird verbunden…",
    finishingConnection: "Kontoverbindung wird abgeschlossen…",
    finishingSignIn: "Anmeldung wird abgeschlossen…",
    failedTitle: "Anmeldung fehlgeschlagen",
    linkFailedTitle: "Account linking failed",
    backToSignIn: "Zurück zur Anmeldung",
    backToDashboard: "Back to dashboard",
    linkGoogleFailed:
      "Ihr Google-Konto konnte nicht verbunden werden. Bitte versuchen Sie es erneut.",
    completeSignInFailed:
      "Anmeldung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
    oauthErrorFallback:
      "Bei der Anmeldung ist etwas schiefgelaufen. Bitte versuchen Sie es erneut.",
    emailMismatch:
      "The Google account email does not match your signed-in account. Use the Google account with the same email address.",
    accountUnavailable:
      "This account is unavailable. Please contact support.",
    messages: {
      unknown:
        "Bei der Anmeldung ist etwas schiefgelaufen. Bitte versuchen Sie es erneut.",
      missing_auth_code:
        "Der federierte Anmeldelink ist unvollständig. Bitte versuchen Sie es erneut.",
      token_exchange_failed:
        "Wir konnten Ihre Anmeldung nicht verifizieren. Bitte versuchen Sie es erneut.",
      server_misconfig:
        "Die Anmeldung ist aufgrund eines Serverkonfigurationsproblems vorübergehend nicht verfügbar. Bitte kontaktieren Sie den Support.",
      server_error:
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es in einem Moment erneut.",
      invalid_request:
        "Die Anmeldeanfrage war ungültig. Bitte starten Sie erneut von der Anmeldeseite.",
      invalid_grant:
        "Die Anmeldeanfrage war ungültig. Bitte starten Sie erneut von der Anmeldeseite.",
      invalid_client:
        "Die Anmeldeanfrage war ungültig. Bitte starten Sie erneut von der Anmeldeseite.",
      unsupported_grant_type:
        "Die Anmeldeanfrage war ungültig. Bitte starten Sie erneut von der Anmeldeseite.",
      not_authenticated:
        "Ihre Sitzung ist nicht mehr gültig. Bitte melden Sie sich erneut an.",
      invalid_session:
        "Ihre Sitzung ist nicht mehr gültig. Bitte melden Sie sich erneut an.",
      refresh_unavailable:
        "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      refresh_revoked:
        "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
    },
  },
  social: {
    connected: "Verbunden",
    genericError: "Etwas ist schiefgelaufen, bitte versuchen Sie es erneut",
    settingsHeading: "Verbundene Konten",
    linkGoogle: "Google verknüpfen",
  },
  chrome: {
    backgroundAlt: "Hintergrund",
  },
  errors: {
    supportHint:
      "Wenn Sie glauben, dass dies ein Fehler ist, kontaktieren Sie bitte den Support.",
    genericDescription:
      "Etwas ist schiefgelaufen, bitte versuchen Sie es erneut.",
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
      accountNotFound: "Es existiert kein Konto mit dieser E-Mail-Adresse",
      pleaseSignUp: "Bitte registrieren Sie sich",
      invalidCredentials:
        "Falsche E-Mail-Adresse oder falsches Passwort, bitte versuchen Sie es erneut.",
      invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    },
    signup: {
      invalidFirstName: "Bitte geben Sie einen gültigen Vornamen ein",
      invalidLastName: "Bitte geben Sie einen gültigen Nachnamen ein",
      emailExists: "Es existiert bereits ein Konto mit dieser E-Mail-Adresse",
      pleaseSignIn: "Bitte melden Sie sich an",
      invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    },
    confirmSignup: {
      accountNotFound:
        "Es existiert kein Konto mit der angegebenen E-Mail-Adresse",
      accountNotFoundToast:
        "Es existiert kein Konto mit der angegebenen E-Mail-Adresse",
      alreadyVerified: "Diese E-Mail ist bereits verifiziert",
      alreadyVerifiedToast:
        "Bitte melden Sie sich an, um auf Ihr Konto zuzugreifen.",
      pleaseSignIn: "Bitte melden Sie sich an",
      invalidCode:
        "Ungültiger Verifizierungscode, bitte versuchen Sie es erneut",
      invalidCodeToast: "Ungültiger Verifizierungscode",
      tryAgain: "Bitte versuchen Sie es erneut.",
      sessionExpired: "Bestätigungssitzung abgelaufen",
      sessionExpiredToast: "Bestätigungssitzung abgelaufen",
      sessionExpiredHint:
        "Bitte registrieren Sie sich erneut, um einen neuen Bestätigungscode zu erhalten.",
    },
    forgotPassword: {
      oauthOnly:
        "Sie haben sich mit einem Social-Media-Konto registriert. Bitte melden Sie sich stattdessen mit Google an oder legen Sie ein Passwort in Ihren Kontosicherheitseinstellungen fest.",
      socialOnly:
        "Bitte melden Sie sich mit Ihrem Social-Media-Konto an, anstatt ein Passwort zurückzusetzen.",
      accountNotFound: "Es existiert kein Konto mit dieser E-Mail-Adresse",
      pleaseSignUp: "Bitte registrieren Sie sich",
      blocked: "Unbefugter Zugriff: Ihr Konto ist gesperrt",
      invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      processFailed: "Vorgang fehlgeschlagen",
      incorrectEmail:
        "Falsche E-Mail-Adresse, bitte geben Sie eine gültige E-Mail-Adresse ein.",
    },
    resetPassword: {
      accountNotFound: "Konto existiert nicht, bitte registrieren Sie sich",
      pleaseSignUp: "Bitte registrieren Sie sich",
      verifyFirst: "Bitte verifizieren Sie zuerst Ihr Konto",
      blocked: "Unbefugter Zugriff: Ihr Konto ist gesperrt",
      invalidPassword: "Bitte geben Sie ein gültiges Passwort ein",
      invalidPasswordToast: "Ungültiges Passwort",
      invalidCode: "Ungültiger Verifizierungscode",
      invalidCodeToast: "Ungültiger Verifizierungscode",
      tryAgain: "Bitte versuchen Sie es erneut.",
    },
    fallbacks: {
      signin: "Anmeldung fehlgeschlagen",
      signup: "Registrierung fehlgeschlagen",
      confirmSignup: "Registrierungsbestätigung fehlgeschlagen",
      confirmSignupField:
        "Etwas ist schiefgelaufen, bitte versuchen Sie es erneut.",
      forgotPassword: "Vorgang fehlgeschlagen",
      resetPassword: "Passwort zurücksetzen fehlgeschlagen",
    },
  },
};
