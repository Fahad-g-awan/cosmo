import type { AuthMessages } from "./types";

export const elAuth: AuthMessages = {
  pages: {
    signin: { title: "Σύνδεση στον λογαριασμό σας" },
    signup: { title: "Εγγραφή νέου λογαριασμού" },
    forgotPassword: {
      title: "Ξεχάσατε τον κωδικό;",
      subtitle:
        "Εισαγάγετε τη διεύθυνση e-mail σας και θα σας στείλουμε σύνδεσμο για επαναφορά του κωδικού.",
    },
    resetPassword: {
      title: "Δημιουργία νέου κωδικού",
      subtitle:
        "Ο νέος κωδικός πρέπει να διαφέρει από τους προηγουμένως χρησιμοποιημένους κωδικούς",
    },
    confirmSignup: {
      title: "Επαληθεύστε το e-mail σας",
      subtitle: "Παρακαλώ εισαγάγετε τον κωδικό επαλήθευσης που στάλθηκε στο e-mail σας",
    },
  },
  labels: {
    email: "E-mail",
    password: "Κωδικός",
    firstName: "Όνομα",
    lastName: "Επώνυμο",
    verificationCode: "Κωδικός επαλήθευσης",
    newPassword: "Νέος κωδικός",
    confirmPassword: "Επιβεβαίωση κωδικού",
  },
  placeholders: {
    email: "E-mail",
    password: "Κωδικός",
    firstName: "Όνομα",
    lastName: "Επώνυμο",
    enterEmail: "Εισαγάγετε e-mail",
    verificationCode: "Εισαγάγετε κωδικό επαλήθευσης",
    newPassword: "Νέος κωδικός",
    confirmPassword: "Επιβεβαίωση κωδικού",
    resetCode: "Εισαγάγετε κωδικό επαναφοράς",
  },
  buttons: {
    signIn: "Σύνδεση",
    registerNow: "Εγγραφή τώρα",
    sendResetCode: "Αποστολή κωδικού επαναφοράς",
    backToLogin: "Επιστροφή στη σύνδεση",
    verifyEmail: "Επαλήθευση e-mail",
    resetPassword: "Επαναφορά κωδικού",
    tryAgain: "Δοκιμάστε ξανά",
    backToSignIn: "Επιστροφή στη σύνδεση",
    resendCode: "Επαναποστολή κωδικού",
    resendIn: (seconds) => `Επαναποστολή σε ${seconds}δ`,
    sending: "Αποστολή...",
  },
  links: {
    forgotPassword: "Ξεχάσατε τον κωδικό;",
  },
  dividers: {
    orUse: "Ή χρησιμοποιήστε",
  },
  banners: {
    passwordSet: {
      title: "Ο κωδικός ορίστηκε",
      message:
        "Ο κωδικός σας ορίστηκε με επιτυχία. Συνδεθείτε με το e-mail και τον νέο κωδικό σας.",
    },
    passwordUpdated: {
      title: "Ο κωδικός ενημερώθηκε",
      message:
        "Ο κωδικός σας ενημερώθηκε με επιτυχία. Συνδεθείτε με τον νέο κωδικό σας.",
    },
  },
  validation: {
    emailRequired: "Το e-mail είναι υποχρεωτικό",
    passwordRequired: "Ο κωδικός είναι υποχρεωτικός",
    emailInvalid: "Παρακαλώ εισαγάγετε έγκυρο e-mail",
    passwordInvalid: "Παρακαλώ εισαγάγετε έγκυρο κωδικό",
    firstNameInvalid: "Παρακαλώ εισαγάγετε έγκυρο όνομα",
    lastNameInvalid: "Παρακαλώ εισαγάγετε έγκυρο επώνυμο",
    codeRequired: "Παρακαλώ εισαγάγετε κωδικό επαλήθευσης",
    codeMinLength:
      "Ο κωδικός επαλήθευσης είναι υποχρεωτικός και πρέπει να έχει τουλάχιστον 6 χαρακτήρες.",
    passwordMinLength: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.",
    passwordPolicy:
      "Password must contain uppercase, lowercase, number, and special character",
    passwordsMismatch: "Οι κωδικοί δεν ταιριάζουν.",
  },
  toasts: {
    verificationSent: "Ο κωδικός επαλήθευσης στάλθηκε στο e-mail σας",
    emailVerified: "Το e-mail επαληθεύτηκε με επιτυχία",
    emailVerifiedSignIn: "Το e-mail επαληθεύτηκε",
    emailVerifiedSignInHint: "Παρακαλώ συνδεθείτε για να συνεχίσετε.",
    resetCodeSent: "Ο κωδικός επαναφοράς στάλθηκε στο e-mail σας!",
    resetCodeResent: "Ο κωδικός επαναφοράς στάλθηκε",
    resetCodeResentHint: "Παρακαλώ ελέγξτε το e-mail σας.",
    resendSuccess: "Ο κωδικός επαλήθευσης στάλθηκε",
    resendSuccessHint: "Παρακαλώ ελέγξτε το e-mail σας για τον κωδικό επαλήθευσης.",
    resendFailed: "Δεν ήταν δυνατή η επαναποστολή του κωδικού",
    resendFailedHint: "Παρακαλώ δοκιμάστε ξανά σε λίγο.",
    passwordResetSuccess: "Ο κωδικός επαναφέρθηκε με επιτυχία",
    genericError: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά",
    fixValidationErrors: "Please fix the validation errors",
    fixHighlightedFields: "Please fix the highlighted fields",
  },
  confirmSignup: {
    didntGetCode: "Δεν λάβατε κωδικό;",
    tooManyAttempts:
      "Πάρα πολλές προσπάθειες. Παρακαλώ περιμένετε λίγο πριν ζητήσετε νέο κωδικό.",
  },
  resetPassword: {
    successTitle: "Επιτυχής επαναφορά κωδικού!",
    successMessage: "Ο κωδικός σας ενημερώθηκε με επιτυχία.",
    rejectTitle: "Η επαναφορά κωδικού απέτυχε",
    rejectMessage:
      "Δεν μπορέσαμε να επαναφέρουμε τον κωδικό σας. Παρακαλώ δοκιμάστε ξανά.",
    confirmPasswordLabel: "Επιβεβαίωση κωδικού",
  },
  processing: {
    completing: "Ολοκλήρωση σύνδεσης…",
    connectingGoogle: "Σύνδεση του λογαριασμού Google…",
    finishingConnection: "Ολοκλήρωση σύνδεσης λογαριασμού…",
    finishingSignIn: "Ολοκλήρωση σύνδεσης…",
    failedTitle: "Η σύνδεση απέτυχε",
    linkFailedTitle: "Account linking failed",
    backToSignIn: "Επιστροφή στη σύνδεση",
    backToDashboard: "Back to dashboard",
    linkGoogleFailed:
      "Δεν ήταν δυνατή η σύνδεση του λογαριασμού Google. Παρακαλώ δοκιμάστε ξανά.",
    completeSignInFailed:
      "Δεν ήταν δυνατή η ολοκλήρωση της σύνδεσης. Παρακαλώ δοκιμάστε ξανά.",
    oauthErrorFallback:
      "Κάτι πήγε στραβά κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά.",
    emailMismatch:
      "The Google account email does not match your signed-in account. Use the Google account with the same email address.",
    accountUnavailable:
      "This account is unavailable. Please contact support.",
    messages: {
      unknown:
        "Κάτι πήγε στραβά κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά.",
      missing_auth_code:
        "Ο σύνδεσμος ομοσπονδιακής σύνδεσης είναι ελλιπής. Παρακαλώ δοκιμάστε ξανά.",
      token_exchange_failed:
        "Δεν μπορέσαμε να επαληθεύσουμε τη σύνδεσή σας. Παρακαλώ δοκιμάστε ξανά.",
      server_misconfig:
        "Η σύνδεση δεν είναι προσωρινά διαθέσιμη λόγω προβλήματος ρύθμισης διακομιστή. Παρακαλώ επικοινωνήστε με την υποστήριξη.",
      server_error:
        "Προέκυψε απροσδόκητο σφάλμα. Παρακαλώ δοκιμάστε ξανά σε λίγο.",
      invalid_request:
        "Το αίτημα σύνδεσης ήταν μη έγκυρο. Παρακαλώ ξεκινήστε ξανά από τη σελίδα σύνδεσης.",
      invalid_grant:
        "Το αίτημα σύνδεσης ήταν μη έγκυρο. Παρακαλώ ξεκινήστε ξανά από τη σελίδα σύνδεσης.",
      invalid_client:
        "Το αίτημα σύνδεσης ήταν μη έγκυρο. Παρακαλώ ξεκινήστε ξανά από τη σελίδα σύνδεσης.",
      unsupported_grant_type:
        "Το αίτημα σύνδεσης ήταν μη έγκυρο. Παρακαλώ ξεκινήστε ξανά από τη σελίδα σύνδεσης.",
      not_authenticated:
        "Η συνεδρία σας δεν είναι πλέον έγκυρη. Παρακαλώ συνδεθείτε ξανά.",
      invalid_session:
        "Η συνεδρία σας δεν είναι πλέον έγκυρη. Παρακαλώ συνδεθείτε ξανά.",
      refresh_unavailable:
        "Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.",
      refresh_revoked:
        "Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.",
    },
  },
  social: {
    connected: "Συνδεδεμένο",
    genericError: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά",
    settingsHeading: "Συνδεδεμένοι λογαριασμοί",
    linkGoogle: "Σύνδεση Google",
  },
  chrome: {
    backgroundAlt: "Φόντο",
  },
  errors: {
    supportHint:
      "Αν πιστεύετε ότι πρόκειται για λάθος, παρακαλώ επικοινωνήστε με την υποστήριξη.",
    genericDescription: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.",
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
      accountNotFound: "Δεν υπάρχει λογαριασμός με αυτό το e-mail",
      pleaseSignUp: "Παρακαλώ εγγραφείτε",
      invalidCredentials:
        "Λανθασμένο e-mail ή κωδικός, παρακαλώ δοκιμάστε ξανά.",
      invalidEmail: "Παρακαλώ εισαγάγετε έγκυρο e-mail",
    },
    signup: {
      invalidFirstName: "Παρακαλώ εισαγάγετε έγκυρο όνομα",
      invalidLastName: "Παρακαλώ εισαγάγετε έγκυρο επώνυμο",
      emailExists: "Υπάρχει ήδη λογαριασμός με αυτό το e-mail",
      pleaseSignIn: "Παρακαλώ συνδεθείτε",
      invalidEmail: "Παρακαλώ εισαγάγετε έγκυρο e-mail",
    },
    confirmSignup: {
      accountNotFound: "Δεν υπάρχει λογαριασμός με το δοθέν e-mail",
      accountNotFoundToast: "Δεν υπάρχει λογαριασμός με το δοθέν e-mail",
      alreadyVerified: "Αυτό το e-mail είναι ήδη επαληθευμένο",
      alreadyVerifiedToast:
        "Παρακαλώ συνδεθείτε για να αποκτήσετε πρόσβαση στον λογαριασμό σας.",
      pleaseSignIn: "Παρακαλώ συνδεθείτε",
      invalidCode:
        "Μη έγκυρος κωδικός επαλήθευσης, παρακαλώ δοκιμάστε ξανά",
      invalidCodeToast: "Μη έγκυρος κωδικός επαλήθευσης",
      tryAgain: "Παρακαλώ δοκιμάστε ξανά.",
      sessionExpired: "Η περίοδος επαλήθευσης έληξε",
      sessionExpiredToast: "Η περίοδος επαλήθευσης έληξε",
      sessionExpiredHint:
        "Παρακαλώ εγγραφείτε ξανά για να λάβετε νέο κωδικό επαλήθευσης.",
    },
    forgotPassword: {
      oauthOnly:
        "Εγγραφήκατε με κοινωνικό λογαριασμό. Συνδεθείτε με Google ή ορίστε κωδικό από τις ρυθμίσεις ασφαλείας του λογαριασμού σας.",
      socialOnly:
        "Συνδεθείτε με τον κοινωνικό λογαριασμό σας αντί να επαναφέρετε κωδικό.",
      accountNotFound: "Δεν υπάρχει λογαριασμός με αυτό το e-mail",
      pleaseSignUp: "Παρακαλώ εγγραφείτε",
      blocked: "Μη εξουσιοδοτημένη πρόσβαση: ο λογαριασμός σας είναι αποκλεισμένος",
      invalidEmail: "Παρακαλώ εισαγάγετε έγκυρο e-mail",
      processFailed: "Η διαδικασία απέτυχε",
      incorrectEmail: "Λανθασμένο e-mail, παρακαλώ εισαγάγετε έγκυρο e-mail.",
    },
    resetPassword: {
      accountNotFound: "Ο λογαριασμός δεν υπάρχει, παρακαλώ εγγραφείτε",
      pleaseSignUp: "Παρακαλώ εγγραφείτε",
      verifyFirst: "Παρακαλώ επαληθεύστε πρώτα τον λογαριασμό σας",
      blocked: "Μη εξουσιοδοτημένη πρόσβαση: ο λογαριασμός σας είναι αποκλεισμένος",
      invalidPassword: "Παρακαλώ εισαγάγετε έγκυρο κωδικό",
      invalidPasswordToast: "Μη έγκυρος κωδικός",
      invalidCode: "Μη έγκυρος κωδικός επαλήθευσης",
      invalidCodeToast: "Μη έγκυρος κωδικός επαλήθευσης",
      tryAgain: "Παρακαλώ δοκιμάστε ξανά.",
    },
    fallbacks: {
      signin: "Η σύνδεση απέτυχε",
      signup: "Η εγγραφή απέτυχε",
      confirmSignup: "Η επιβεβαίωση εγγραφής απέτυχε",
      confirmSignupField: "Κάτι πήγε στραβά, παρακαλώ δοκιμάστε ξανά.",
      forgotPassword: "Η διαδικασία απέτυχε",
      resetPassword: "Η επαναφορά κωδικού απέτυχε",
    },
  },
};
