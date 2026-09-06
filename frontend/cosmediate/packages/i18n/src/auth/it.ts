import type { AuthMessages } from "./types";

export const itAuth: AuthMessages = {
  pages: {
    signin: { title: "Accedi al tuo account" },
    signup: { title: "Registra un nuovo account" },
    forgotPassword: {
      title: "Password dimenticata?",
      subtitle:
        "Inserisci il tuo indirizzo e-mail e ti invieremo un link per reimpostare la password.",
    },
    resetPassword: {
      title: "Crea una nuova password",
      subtitle:
        "La nuova password deve essere diversa dalle password utilizzate in precedenza",
    },
    confirmSignup: {
      title: "Verifica la tua e-mail",
      subtitle: "Inserisci il codice di verifica inviato alla tua e-mail",
    },
  },
  labels: {
    email: "E-mail",
    password: "Password",
    firstName: "Nome",
    lastName: "Cognome",
    verificationCode: "Codice di verifica",
    newPassword: "Nuova password",
    confirmPassword: "Conferma password",
  },
  placeholders: {
    email: "E-mail",
    password: "Password",
    firstName: "Nome",
    lastName: "Cognome",
    enterEmail: "Inserisci e-mail",
    verificationCode: "Inserisci codice di verifica",
    newPassword: "Nuova password",
    confirmPassword: "Conferma password",
    resetCode: "Inserisci codice di reset",
  },
  buttons: {
    signIn: "Accedi",
    registerNow: "Registrati ora",
    sendResetCode: "Invia codice di reset",
    backToLogin: "Torna al login",
    verifyEmail: "Verifica e-mail",
    resetPassword: "Reimposta password",
    tryAgain: "Riprova",
    backToSignIn: "Torna all'accesso",
    resendCode: "Reinvia codice",
    resendIn: (seconds) => `Reinvia tra ${seconds}s`,
    sending: "Invio in corso...",
  },
  links: {
    forgotPassword: "Password dimenticata?",
  },
  dividers: {
    orUse: "Oppure usa",
  },
  banners: {
    passwordSet: {
      title: "Password impostata",
      message:
        "La password è stata impostata correttamente. Accedi con la tua e-mail e la nuova password.",
    },
    passwordUpdated: {
      title: "Password aggiornata",
      message:
        "La password è stata aggiornata correttamente. Accedi con la nuova password.",
    },
  },
  validation: {
    emailRequired: "L'e-mail è obbligatoria",
    passwordRequired: "La password è obbligatoria",
    emailInvalid: "Inserisci un indirizzo e-mail valido",
    passwordInvalid: "Inserisci una password valida",
    firstNameInvalid: "Inserisci un nome valido",
    lastNameInvalid: "Inserisci un cognome valido",
    codeRequired: "Inserisci il codice di verifica",
    codeMinLength:
      "Il codice di verifica è obbligatorio e deve contenere almeno 6 caratteri.",
    passwordMinLength: "La password deve contenere almeno 8 caratteri.",
    passwordPolicy:
      "Password must contain uppercase, lowercase, number, and special character",
    passwordsMismatch: "Le password non corrispondono.",
  },
  toasts: {
    verificationSent: "Codice di verifica inviato alla tua e-mail",
    emailVerified: "E-mail verificata con successo",
    emailVerifiedSignIn: "E-mail verificata",
    emailVerifiedSignInHint: "Accedi per continuare.",
    resetCodeSent: "Codice di reset inviato alla tua e-mail!",
    resetCodeResent: "Codice di reset inviato",
    resetCodeResentHint: "Controlla la tua e-mail.",
    resendSuccess: "Codice di verifica inviato",
    resendSuccessHint: "Controlla la tua e-mail per il codice di verifica.",
    resendFailed: "Impossibile reinviare il codice",
    resendFailedHint: "Riprova tra un momento.",
    passwordResetSuccess: "Password reimpostata con successo",
    genericError: "Qualcosa è andato storto, riprova",
    fixValidationErrors: "Please fix the validation errors",
    fixHighlightedFields: "Please fix the highlighted fields",
  },
  confirmSignup: {
    didntGetCode: "Non hai ricevuto un codice?",
    tooManyAttempts:
      "Troppi tentativi. Attendi prima di richiedere un altro codice.",
  },
  resetPassword: {
    successTitle: "Password reimpostata con successo!",
    successMessage: "La password è stata aggiornata correttamente.",
    rejectTitle: "Reimpostazione password non riuscita",
    rejectMessage:
      "Non siamo riusciti a reimpostare la password. Riprova.",
    confirmPasswordLabel: "Conferma password",
  },
  processing: {
    completing: "Completamento accesso…",
    connectingGoogle: "Connessione del tuo account Google…",
    finishingConnection: "Completamento collegamento account…",
    finishingSignIn: "Completamento accesso…",
    failedTitle: "Accesso non riuscito",
    linkFailedTitle: "Account linking failed",
    backToSignIn: "Torna all'accesso",
    backToDashboard: "Back to dashboard",
    linkGoogleFailed:
      "Impossibile collegare il tuo account Google. Riprova.",
    completeSignInFailed: "Impossibile completare l'accesso. Riprova.",
    oauthErrorFallback:
      "Qualcosa è andato storto durante l'accesso. Riprova.",
    emailMismatch:
      "The Google account email does not match your signed-in account. Use the Google account with the same email address.",
    accountUnavailable:
      "This account is unavailable. Please contact support.",
    messages: {
      unknown:
        "Qualcosa è andato storto durante l'accesso. Riprova.",
      missing_auth_code:
        "Il link di accesso federato è incompleto. Riprova.",
      token_exchange_failed:
        "Non siamo riusciti a verificare l'accesso. Riprova.",
      server_misconfig:
        "L'accesso è temporaneamente non disponibile a causa di un problema di configurazione del server. Contatta il supporto.",
      server_error:
        "Si è verificato un errore imprevisto. Riprova tra un momento.",
      invalid_request:
        "La richiesta di accesso non era valida. Ricomincia dalla pagina di accesso.",
      invalid_grant:
        "La richiesta di accesso non era valida. Ricomincia dalla pagina di accesso.",
      invalid_client:
        "La richiesta di accesso non era valida. Ricomincia dalla pagina di accesso.",
      unsupported_grant_type:
        "La richiesta di accesso non era valida. Ricomincia dalla pagina di accesso.",
      not_authenticated:
        "La sessione non è più valida. Accedi di nuovo.",
      invalid_session:
        "La sessione non è più valida. Accedi di nuovo.",
      refresh_unavailable:
        "La sessione è scaduta. Accedi di nuovo.",
      refresh_revoked:
        "La sessione è scaduta. Accedi di nuovo.",
    },
  },
  social: {
    connected: "Collegato",
    genericError: "Qualcosa è andato storto, riprova",
    settingsHeading: "Account collegati",
    linkGoogle: "Collega Google",
  },
  chrome: {
    backgroundAlt: "Sfondo",
  },
  errors: {
    supportHint:
      "Se ritieni che si tratti di un errore, contatta il supporto.",
    genericDescription: "Qualcosa è andato storto, riprova.",
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
      accountNotFound: "Non esiste un account con questa e-mail",
      pleaseSignUp: "Registrati",
      invalidCredentials: "E-mail o password errati, riprova.",
      invalidEmail: "Inserisci un indirizzo e-mail valido",
    },
    signup: {
      invalidFirstName: "Inserisci un nome valido",
      invalidLastName: "Inserisci un cognome valido",
      emailExists: "Esiste già un account con questa e-mail",
      pleaseSignIn: "Accedi",
      invalidEmail: "Inserisci un indirizzo e-mail valido",
    },
    confirmSignup: {
      accountNotFound: "Non esiste un account con l'e-mail indicata",
      accountNotFoundToast: "Non esiste un account con l'e-mail indicata",
      alreadyVerified: "Questa e-mail è già verificata",
      alreadyVerifiedToast: "Accedi per accedere al tuo account.",
      pleaseSignIn: "Accedi",
      invalidCode: "Codice di verifica non valido, riprova",
      invalidCodeToast: "Codice di verifica non valido",
      tryAgain: "Riprova.",
      sessionExpired: "Sessione di verifica scaduta",
      sessionExpiredToast: "Sessione di verifica scaduta",
      sessionExpiredHint:
        "Registrati di nuovo per ricevere un nuovo codice di verifica.",
    },
    forgotPassword: {
      oauthOnly:
        "Ti sei registrato con un account social. Accedi con Google oppure imposta una password dalle impostazioni di sicurezza del tuo account.",
      socialOnly:
        "Accedi con il tuo account social invece di reimpostare una password.",
      accountNotFound: "Non esiste un account con questa e-mail",
      pleaseSignUp: "Registrati",
      blocked: "Accesso non autorizzato: il tuo account è bloccato",
      invalidEmail: "Inserisci un indirizzo e-mail valido",
      processFailed: "Processo non riuscito",
      incorrectEmail: "E-mail errata, inserisci un indirizzo e-mail valido.",
    },
    resetPassword: {
      accountNotFound: "L'account non esiste, registrati",
      pleaseSignUp: "Registrati",
      verifyFirst: "Verifica prima il tuo account",
      blocked: "Accesso non autorizzato: il tuo account è bloccato",
      invalidPassword: "Inserisci una password valida",
      invalidPasswordToast: "Password non valida",
      invalidCode: "Codice di verifica non valido",
      invalidCodeToast: "Codice di verifica non valido",
      tryAgain: "Riprova.",
    },
    fallbacks: {
      signin: "Accesso non riuscito",
      signup: "Registrazione non riuscita",
      confirmSignup: "Conferma registrazione non riuscita",
      confirmSignupField: "Qualcosa è andato storto, riprova.",
      forgotPassword: "Processo non riuscito",
      resetPassword: "Reimpostazione password non riuscita",
    },
  },
};
