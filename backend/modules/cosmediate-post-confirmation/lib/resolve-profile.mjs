/**
 * Build patient profile fields from Cognito PostConfirmation userAttributes.
 */
export const resolveProfileFromUserAttributes = (userAttributes, email) => {
  const givenName = userAttributes?.given_name ?? "";
  const familyName = userAttributes?.family_name ?? "";
  const fullName = userAttributes?.name ?? "";

  let firstName = givenName;
  let lastName = familyName;

  if (!firstName && !lastName && fullName) {
    const parts = fullName.trim().split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ");
  }

  if (!firstName) {
    firstName = (email || "").split("@")[0] ?? "";
  }

  return {
    firstName,
    lastName,
    age: null,
    country: null,
    state: null,
    city: null,
    completeAddress: null,
    postalCode: null,
  };
};
