import type { AuthMessages } from "./types";

export const frAuth: AuthMessages = {
  pages: {
    signin: { title: "Connectez-vous à votre compte" },
    signup: { title: "Créer un nouveau compte" },
    forgotPassword: {
      title: "Mot de passe oublié ?",
      subtitle:
        "Saisissez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
    },
    resetPassword: {
      title: "Créer un nouveau mot de passe",
      subtitle:
        "Votre nouveau mot de passe doit être différent des mots de passe précédemment utilisés",
    },
    confirmSignup: {
      title: "Vérifiez votre e-mail",
      subtitle: "Veuillez saisir le code de vérification envoyé à votre e-mail",
    },
  },
  labels: {
    email: "E-mail",
    password: "Mot de passe",
    firstName: "Prénom",
    lastName: "Nom",
    verificationCode: "Code de vérification",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
  },
  placeholders: {
    email: "E-mail",
    password: "Mot de passe",
    firstName: "Prénom",
    lastName: "Nom",
    enterEmail: "Saisir l'e-mail",
    verificationCode: "Saisir le code de vérification",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    resetCode: "Saisir le code de réinitialisation",
  },
  buttons: {
    signIn: "Se connecter",
    registerNow: "S'inscrire maintenant",
    sendResetCode: "Envoyer le code de réinitialisation",
    backToLogin: "Retour à la connexion",
    verifyEmail: "Vérifier l'e-mail",
    resetPassword: "Réinitialiser le mot de passe",
    tryAgain: "Réessayer",
    backToSignIn: "Retour à la connexion",
    resendCode: "Renvoyer le code",
    resendIn: (seconds) => `Renvoyer dans ${seconds}s`,
    sending: "Envoi en cours...",
  },
  links: {
    forgotPassword: "Mot de passe oublié ?",
  },
  dividers: {
    orUse: "Ou utiliser",
  },
  banners: {
    passwordSet: {
      title: "Mot de passe défini",
      message:
        "Votre mot de passe a été défini avec succès. Veuillez vous connecter avec votre e-mail et votre nouveau mot de passe.",
    },
    passwordUpdated: {
      title: "Mot de passe mis à jour",
      message:
        "Votre mot de passe a été mis à jour avec succès. Veuillez vous connecter avec votre nouveau mot de passe.",
    },
  },
  validation: {
    emailRequired: "L'e-mail est requis",
    passwordRequired: "Le mot de passe est requis",
    emailInvalid: "Veuillez saisir une adresse e-mail valide",
    passwordInvalid: "Veuillez saisir un mot de passe valide",
    firstNameInvalid: "Veuillez saisir un prénom valide",
    lastNameInvalid: "Veuillez saisir un nom valide",
    codeRequired: "Veuillez saisir le code de vérification",
    codeMinLength:
      "Le code de vérification est requis et doit contenir au moins 6 caractères.",
    passwordMinLength: "Le mot de passe doit contenir au moins 8 caractères.",
    passwordPolicy:
      "Password must contain uppercase, lowercase, number, and special character",
    passwordsMismatch: "Les mots de passe ne correspondent pas.",
  },
  toasts: {
    verificationSent: "Code de vérification envoyé à votre e-mail",
    emailVerified: "E-mail vérifié avec succès",
    emailVerifiedSignIn: "E-mail vérifié",
    emailVerifiedSignInHint: "Veuillez vous connecter pour continuer.",
    resetCodeSent: "Code de réinitialisation envoyé à votre e-mail !",
    resetCodeResent: "Code de réinitialisation envoyé",
    resetCodeResentHint: "Veuillez vérifier votre e-mail.",
    resendSuccess: "Code de vérification envoyé",
    resendSuccessHint:
      "Veuillez vérifier votre e-mail pour le code de vérification.",
    resendFailed: "Impossible de renvoyer le code",
    resendFailedHint: "Veuillez réessayer dans un instant.",
    passwordResetSuccess: "Mot de passe réinitialisé avec succès",
    genericError: "Une erreur s'est produite, veuillez réessayer",
    fixValidationErrors: "Please fix the validation errors",
    fixHighlightedFields: "Please fix the highlighted fields",
  },
  confirmSignup: {
    didntGetCode: "Vous n'avez pas reçu de code ?",
    tooManyAttempts:
      "Trop de tentatives. Veuillez patienter avant de demander un autre code.",
  },
  resetPassword: {
    successTitle: "Mot de passe réinitialisé avec succès !",
    successMessage: "Votre mot de passe a été mis à jour avec succès.",
    rejectTitle: "Échec de la réinitialisation du mot de passe",
    rejectMessage:
      "Nous n'avons pas pu réinitialiser votre mot de passe. Veuillez réessayer.",
    confirmPasswordLabel: "Confirmer le mot de passe",
  },
  processing: {
    completing: "Finalisation de la connexion…",
    connectingGoogle: "Connexion de votre compte Google…",
    finishingConnection: "Finalisation de la liaison du compte…",
    finishingSignIn: "Finalisation de la connexion…",
    failedTitle: "Échec de la connexion",
    linkFailedTitle: "Account linking failed",
    backToSignIn: "Retour à la connexion",
    backToDashboard: "Back to dashboard",
    linkGoogleFailed:
      "Impossible de connecter votre compte Google. Veuillez réessayer.",
    completeSignInFailed:
      "Impossible de finaliser la connexion. Veuillez réessayer.",
    oauthErrorFallback:
      "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
    emailMismatch:
      "The Google account email does not match your signed-in account. Use the Google account with the same email address.",
    accountUnavailable:
      "This account is unavailable. Please contact support.",
    messages: {
      unknown:
        "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
      missing_auth_code:
        "Le lien de connexion fédérée est incomplet. Veuillez réessayer.",
      token_exchange_failed:
        "Nous n'avons pas pu vérifier votre connexion. Veuillez réessayer.",
      server_misconfig:
        "La connexion est temporairement indisponible en raison d'un problème de configuration serveur. Veuillez contacter le support.",
      server_error:
        "Une erreur inattendue s'est produite. Veuillez réessayer dans un instant.",
      invalid_request:
        "La demande de connexion était invalide. Veuillez recommencer depuis la page de connexion.",
      invalid_grant:
        "La demande de connexion était invalide. Veuillez recommencer depuis la page de connexion.",
      invalid_client:
        "La demande de connexion était invalide. Veuillez recommencer depuis la page de connexion.",
      unsupported_grant_type:
        "La demande de connexion était invalide. Veuillez recommencer depuis la page de connexion.",
      not_authenticated:
        "Votre session n'est plus valide. Veuillez vous reconnecter.",
      invalid_session:
        "Votre session n'est plus valide. Veuillez vous reconnecter.",
      refresh_unavailable:
        "Votre session a expiré. Veuillez vous reconnecter.",
      refresh_revoked:
        "Votre session a expiré. Veuillez vous reconnecter.",
    },
  },
  social: {
    connected: "Connecté",
    genericError: "Une erreur s'est produite, veuillez réessayer",
    settingsHeading: "Comptes connectés",
    linkGoogle: "Lier Google",
  },
  chrome: {
    backgroundAlt: "Arrière-plan",
  },
  errors: {
    supportHint:
      "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.",
    genericDescription: "Une erreur s'est produite, veuillez réessayer.",
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
      accountNotFound: "Aucun compte n'existe avec cette adresse e-mail",
      pleaseSignUp: "Veuillez vous inscrire",
      invalidCredentials:
        "E-mail ou mot de passe incorrect, veuillez réessayer.",
      invalidEmail: "Veuillez saisir une adresse e-mail valide",
    },
    signup: {
      invalidFirstName: "Veuillez saisir un prénom valide",
      invalidLastName: "Veuillez saisir un nom valide",
      emailExists: "Un compte existe déjà avec cette adresse e-mail",
      pleaseSignIn: "Veuillez vous connecter",
      invalidEmail: "Veuillez saisir une adresse e-mail valide",
    },
    confirmSignup: {
      accountNotFound:
        "Aucun compte n'existe avec l'adresse e-mail indiquée",
      accountNotFoundToast:
        "Aucun compte n'existe avec l'adresse e-mail indiquée",
      alreadyVerified: "Cette adresse e-mail est déjà vérifiée",
      alreadyVerifiedToast:
        "Veuillez vous connecter pour accéder à votre compte.",
      pleaseSignIn: "Veuillez vous connecter",
      invalidCode:
        "Code de vérification invalide, veuillez réessayer",
      invalidCodeToast: "Code de vérification invalide",
      tryAgain: "Veuillez réessayer.",
      sessionExpired: "Session de vérification expirée",
      sessionExpiredToast: "Session de vérification expirée",
      sessionExpiredHint:
        "Veuillez vous inscrire à nouveau pour recevoir un nouveau code de vérification.",
    },
    forgotPassword: {
      oauthOnly:
        "Vous vous êtes inscrit avec un compte social. Veuillez vous connecter avec Google, ou définissez un mot de passe dans les paramètres de sécurité de votre compte.",
      socialOnly:
        "Veuillez vous connecter avec votre compte social au lieu de réinitialiser un mot de passe.",
      accountNotFound: "Aucun compte n'existe avec cette adresse e-mail",
      pleaseSignUp: "Veuillez vous inscrire",
      blocked: "Accès non autorisé : votre compte est bloqué",
      invalidEmail: "Veuillez saisir une adresse e-mail valide",
      processFailed: "Échec du processus",
      incorrectEmail:
        "E-mail incorrect, veuillez saisir une adresse e-mail valide.",
    },
    resetPassword: {
      accountNotFound: "Le compte n'existe pas, veuillez vous inscrire",
      pleaseSignUp: "Veuillez vous inscrire",
      verifyFirst: "Veuillez d'abord vérifier votre compte",
      blocked: "Accès non autorisé : votre compte est bloqué",
      invalidPassword: "Veuillez saisir un mot de passe valide",
      invalidPasswordToast: "Mot de passe invalide",
      invalidCode: "Code de vérification invalide",
      invalidCodeToast: "Code de vérification invalide",
      tryAgain: "Veuillez réessayer.",
    },
    fallbacks: {
      signin: "Échec de la connexion",
      signup: "Échec de l'inscription",
      confirmSignup: "Échec de la confirmation d'inscription",
      confirmSignupField: "Une erreur s'est produite, veuillez réessayer.",
      forgotPassword: "Échec du processus",
      resetPassword: "Échec de la réinitialisation du mot de passe",
    },
  },
};
