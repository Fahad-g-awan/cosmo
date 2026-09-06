const ROLE_TO_DELEGATE = {
  ADMIN: "admin",
  SPECIALIST: "specialist",
  MANAGER: "clinicManager",
  PATIENT: "patient",
};

export const tableFor = (role) => ROLE_TO_DELEGATE[role] ?? null;

export const allRoles = () => Object.keys(ROLE_TO_DELEGATE);
