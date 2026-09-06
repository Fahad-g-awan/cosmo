export const validateEmail = (email: string): boolean => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmedEmail);
};

/**
 * Minimum length check — used for sign-in so existing weaker passwords still work.
 * Prefer {@link isStrongPassword} when creating or changing a password.
 */
export const validatePassword = (password: string): boolean => {
  const trimmedPassword = password.trim();
  return trimmedPassword.length >= 8;
};

/** Cognito-aligned policy: upper, lower, digit, special, min 8. */
export const isStrongPassword = (pwd: string): boolean => {
  const strongPwdRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPwdRegex.test(pwd.trim());
};
