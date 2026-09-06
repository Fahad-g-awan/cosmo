import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";

const CLINIC_DUPLICATE_EMAIL_MESSAGE =
  "A patient with this email already exists on Cosmediate. You can find them when creating a booking.";

/**
 * Rejects duplicate patient emails (Identity + non-deleted Patient profile).
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} email
 * @param {object} [options]
 * @param {string} [options.creatorRole] - Caller role for staff-friendly 409 copy.
 */
export const validatePatientEmailAvailable = async (
  prisma,
  email,
  { creatorRole = "" } = {},
) => {
  const errors = [];
  const existing = await prisma.identity.findUnique({
    where: { email: email.toLowerCase() },
    include: { patient: true },
  });

  if (existing?.patient && !existing.patient.deleted) {
    const isStaffCreator = [USER_ROLES.MANAGER, USER_ROLES.SPECIALIST].includes(
      creatorRole,
    );
    errors.push(
      isStaffCreator
        ? CLINIC_DUPLICATE_EMAIL_MESSAGE
        : `Patient already exists: ${email}`,
    );
  }

  return {
    errors,
    foundPatient: existing?.patient ?? null,
    ok: errors.length === 0,
  };
};

export const getPatientById = async (prisma, patientId) => {
  if (!patientId) {
    return { patient: null, errors: ["Patient ID not provided"], ok: false };
  }

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, deleted: false },
    include: { identity: true },
  });

  if (!patient) {
    return {
      errors: [`Patient does not exist: ${patientId}`],
      patient: null,
      ok: false,
    };
  }

  return { errors: [], patient, ok: true };
};
