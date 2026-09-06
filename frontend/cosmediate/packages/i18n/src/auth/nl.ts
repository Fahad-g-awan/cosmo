import type { AuthMessages } from "./types";

export const nlAuth: AuthMessages = {
  pages: {
    signin: { title: "Inloggen op uw account" },
    signup: { title: "Nieuw account registreren" },
    forgotPassword: {
      title: "Wachtwoord vergeten?",
      subtitle:
        "Voer uw e-mailadres in en wij sturen u een link om uw wachtwoord opnieuw in te stellen.",
    },
    resetPassword: {
      title: "Nieuw wachtwoord aanmaken",
      subtitle:
        "Uw nieuwe wachtwoord moet verschillen van eerder gebruikte wachtwoorden",
    },
    confirmSignup: {
      title: "Verifieer uw e-mail",
      subtitle: "Voer de verificatiecode in die naar uw e-mail is verzonden",
    },
  },
  labels: {
    email: "E-mail",
    password: "Wachtwoord",
    firstName: "Voornaam",
    lastName: "Achternaam",
    verificationCode: "Verificatiecode",
    newPassword: "Nieuw wachtwoord",
    confirmPassword: "Bevestig wachtwoord",
  },
  placeholders: {
    email: "E-mail",
    password: "Wachtwoord",
    firstName: "Voornaam",
    lastName: "Achternaam",
    enterEmail: "Voer e-mailadres in",
    verificationCode: "Voer verificatiecode in",
    newPassword: "Nieuw wachtwoord",
    confirmPassword: "Bevestig wachtwoord",
    resetCode: "Voer resetcode in",
  },
  buttons: {
    signIn: "Inloggen",
    registerNow: "Nu registreren",
    sendResetCode: "Resetcode verzenden",
    backToLogin: "Terug naar inloggen",
    verifyEmail: "E-mail verifiëren",
    resetPassword: "Wachtwoord opnieuw instellen",
    tryAgain: "Probeer opnieuw",
    backToSignIn: "Terug naar inloggen",
    resendCode: "Code opnieuw verzenden",
    resendIn: (seconds) => `Opnieuw verzenden over ${seconds}s`,
    sending: "Verzenden...",
  },
  links: {
    forgotPassword: "Wachtwoord vergeten?",
  },
  dividers: {
    orUse: "Of gebruik",
  },
  banners: {
    passwordSet: {
      title: "Wachtwoord ingesteld",
      message:
        "Uw wachtwoord is succesvol ingesteld. Log in met uw e-mailadres en nieuwe wachtwoord.",
    },
    passwordUpdated: {
      title: "Wachtwoord bijgewerkt",
      message:
        "Uw wachtwoord is succesvol bijgewerkt. Log in met uw nieuwe wachtwoord.",
    },
  },
  validation: {
    emailRequired: "E-mailadres is verplicht",
    passwordRequired: "Wachtwoord is verplicht",
    emailInvalid: "Voer een geldig e-mailadres in",
    passwordInvalid: "Voer een geldig wachtwoord in",
    firstNameInvalid: "Voer een geldige voornaam in",
    lastNameInvalid: "Voer een geldige achternaam in",
    codeRequired: "Voer een verificatiecode in",
    codeMinLength:
      "Verificatiecode is verplicht en moet minimaal 6 tekens bevatten.",
    passwordMinLength: "Wachtwoord moet minimaal 8 tekens lang zijn.",
    passwordPolicy:
      "Password must contain uppercase, lowercase, number, and special character",
    passwordsMismatch: "Wachtwoorden komen niet overeen.",
  },
  toasts: {
    verificationSent: "Verificatiecode verzonden naar uw e-mail",
    emailVerified: "E-mail succesvol geverifieerd",
    emailVerifiedSignIn: "E-mail geverifieerd",
    emailVerifiedSignInHint: "Log in om verder te gaan.",
    resetCodeSent: "Resetcode verzonden naar uw e-mail!",
    resetCodeResent: "Resetcode verzonden",
    resetCodeResentHint: "Controleer uw e-mail.",
    resendSuccess: "Verificatiecode verzonden",
    resendSuccessHint: "Controleer uw e-mail voor de verificatiecode.",
    resendFailed: "Code kon niet opnieuw worden verzonden",
    resendFailedHint: "Probeer het over een moment opnieuw.",
    passwordResetSuccess: "Wachtwoord succesvol opnieuw ingesteld",
    genericError: "Er is iets misgegaan, probeer het opnieuw",
    fixValidationErrors: "Please fix the validation errors",
    fixHighlightedFields: "Please fix the highlighted fields",
  },
  confirmSignup: {
    didntGetCode: "Geen code ontvangen?",
    tooManyAttempts:
      "Te veel pogingen. Wacht even voordat u opnieuw een code aanvraagt.",
  },
  resetPassword: {
    successTitle: "Wachtwoord succesvol opnieuw ingesteld!",
    successMessage: "Uw wachtwoord is succesvol bijgewerkt.",
    rejectTitle: "Wachtwoord opnieuw instellen mislukt",
    rejectMessage:
      "We konden uw wachtwoord niet opnieuw instellen. Probeer het opnieuw.",
    confirmPasswordLabel: "Bevestig wachtwoord",
  },
  processing: {
    completing: "Aanmelden voltooien…",
    connectingGoogle: "Uw Google-account koppelen…",
    finishingConnection: "Accountkoppeling voltooien…",
    finishingSignIn: "Aanmelden voltooien…",
    failedTitle: "Aanmelden mislukt",
    linkFailedTitle: "Account linking failed",
    backToSignIn: "Terug naar inloggen",
    backToDashboard: "Back to dashboard",
    linkGoogleFailed:
      "Uw Google-account kon niet worden gekoppeld. Probeer het opnieuw.",
    completeSignInFailed:
      "Aanmelden kon niet worden voltooid. Probeer het opnieuw.",
    oauthErrorFallback:
      "Er is iets misgegaan tijdens het aanmelden. Probeer het opnieuw.",
    emailMismatch:
      "The Google account email does not match your signed-in account. Use the Google account with the same email address.",
    accountUnavailable:
      "This account is unavailable. Please contact support.",
    messages: {
      unknown:
        "Er is iets misgegaan tijdens het aanmelden. Probeer het opnieuw.",
      missing_auth_code:
        "De federatieve aanmeldlink is onvolledig. Probeer het opnieuw.",
      token_exchange_failed:
        "We konden uw aanmelding niet verifiëren. Probeer het opnieuw.",
      server_misconfig:
        "Aanmelden is tijdelijk niet beschikbaar vanwege een serverconfiguratieprobleem. Neem contact op met support.",
      server_error:
        "Er is een onverwachte fout opgetreden. Probeer het over een moment opnieuw.",
      invalid_request:
        "Het aanmeldverzoek was ongeldig. Begin opnieuw vanaf de inlogpagina.",
      invalid_grant:
        "Het aanmeldverzoek was ongeldig. Begin opnieuw vanaf de inlogpagina.",
      invalid_client:
        "Het aanmeldverzoek was ongeldig. Begin opnieuw vanaf de inlogpagina.",
      unsupported_grant_type:
        "Het aanmeldverzoek was ongeldig. Begin opnieuw vanaf de inlogpagina.",
      not_authenticated:
        "Uw sessie is niet meer geldig. Log opnieuw in.",
      invalid_session:
        "Uw sessie is niet meer geldig. Log opnieuw in.",
      refresh_unavailable:
        "Uw sessie is verlopen. Log opnieuw in.",
      refresh_revoked:
        "Uw sessie is verlopen. Log opnieuw in.",
    },
  },
  social: {
    connected: "Gekoppeld",
    genericError: "Er is iets misgegaan, probeer het opnieuw",
    settingsHeading: "Gekoppelde accounts",
    linkGoogle: "Google koppelen",
  },
  chrome: {
    backgroundAlt: "Achtergrond",
  },
  errors: {
    supportHint:
      "Als u denkt dat dit een vergissing is, neem dan contact op met support.",
    genericDescription: "Er is iets misgegaan, probeer het opnieuw.",
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
      accountNotFound: "Er bestaat geen account met dit e-mailadres",
      pleaseSignUp: "Registreer u alstublieft",
      invalidCredentials:
        "Onjuist e-mailadres of wachtwoord, probeer het opnieuw.",
      invalidEmail: "Voer een geldig e-mailadres in",
    },
    signup: {
      invalidFirstName: "Voer een geldige voornaam in",
      invalidLastName: "Voer een geldige achternaam in",
      emailExists: "Er bestaat al een account met dit e-mailadres",
      pleaseSignIn: "Log alstublieft in",
      invalidEmail: "Voer een geldig e-mailadres in",
    },
    confirmSignup: {
      accountNotFound: "Er bestaat geen account met het opgegeven e-mailadres",
      accountNotFoundToast:
        "Er bestaat geen account met het opgegeven e-mailadres",
      alreadyVerified: "Dit e-mailadres is al geverifieerd",
      alreadyVerifiedToast: "Log in om toegang te krijgen tot uw account.",
      pleaseSignIn: "Log alstublieft in",
      invalidCode:
        "Ongeldige verificatiecode opgegeven, probeer het opnieuw",
      invalidCodeToast: "Ongeldige verificatiecode",
      tryAgain: "Probeer het opnieuw.",
      sessionExpired: "Verificatiesessie verlopen",
      sessionExpiredToast: "Verificatiesessie verlopen",
      sessionExpiredHint:
        "Registreer u opnieuw om een nieuwe verificatiecode te ontvangen.",
    },
    forgotPassword: {
      oauthOnly:
        "U heeft zich aangemeld met een sociaal account. Log in met Google, of stel een wachtwoord in via uw accountbeveiligingsinstellingen.",
      socialOnly:
        "Log in met uw sociale account in plaats van een wachtwoord opnieuw in te stellen.",
      accountNotFound: "Er bestaat geen account met dit e-mailadres",
      pleaseSignUp: "Registreer u alstublieft",
      blocked: "Ongeautoriseerde toegang: uw account is geblokkeerd",
      invalidEmail: "Voer een geldig e-mailadres in",
      processFailed: "Proces mislukt",
      incorrectEmail:
        "Onjuist e-mailadres, voer een geldig e-mailadres in.",
    },
    resetPassword: {
      accountNotFound: "Account bestaat niet, registreer u alstublieft",
      pleaseSignUp: "Registreer u alstublieft",
      verifyFirst: "Verifieer eerst uw account",
      blocked: "Ongeautoriseerde toegang: uw account is geblokkeerd",
      invalidPassword: "Voer een geldig wachtwoord in",
      invalidPasswordToast: "Ongeldig wachtwoord",
      invalidCode: "Ongeldige verificatiecode",
      invalidCodeToast: "Ongeldige verificatiecode",
      tryAgain: "Probeer het opnieuw.",
    },
    fallbacks: {
      signin: "Inloggen mislukt",
      signup: "Registreren mislukt",
      confirmSignup: "Registratie bevestigen mislukt",
      confirmSignupField: "Er is iets misgegaan, probeer het opnieuw.",
      forgotPassword: "Proces mislukt",
      resetPassword: "Wachtwoord opnieuw instellen mislukt",
    },
  },
};
