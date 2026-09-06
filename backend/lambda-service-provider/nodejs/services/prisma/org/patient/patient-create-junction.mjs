import { PATIENT_RELATION_SOURCE } from "../../../../constants/domain/patient.constants.mjs";
import { assertManagerEffectiveClinicAccess } from "../manager/effective-scope.mjs";
import { WORKING_TYPES } from "../../../../constants/domain/shared.constants.mjs";
import { USER_ROLES } from "../../../../constants/auth/roles.constants.mjs";
import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../../lib/errors/http-error.mjs";

/**
 * After a new Patient row is created, upserts clinic/specialist junction rows based on who created the profile.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx - Prisma transaction client.
 * @param {object} params
 * @param {string} params.creatorRole - Caller role (`ADMIN`, `MANAGER`, `SPECIALIST`, etc.).
 * @param {string|null} params.creatorEntityId - Manager or specialist profile id when applicable.
 * @param {string} params.patientId - New patient profile id.
 * @param {string|null} [params.clinicIdBody=null] - Required when a manager creates a patient (active clinic).
 * @returns {Promise<void>}
 * @see backend/docs/clinic-specialist-rules.md
 *
 * @example
 * // Manager create at clinic "cl_1" → one PatientClinic row (source CLINIC_CREATE).
 * await applyPatientCreateJunctionWritesInTx(tx, {
 *   creatorRole: "MANAGER",
 *   creatorEntityId: "mgr_1",
 *   patientId: "pat_1",
 *   clinicIdBody: "cl_1",
 * });
 */
export async function applyPatientCreateJunctionWritesInTx(
  tx,
  { creatorRole, creatorEntityId, patientId, clinicIdBody = null },
) {
  const hasClinicId =
    clinicIdBody != null && String(clinicIdBody).trim() !== "";

  if (
    creatorRole === USER_ROLES.ADMIN ||
    creatorRole === USER_ROLES.PATIENT ||
    creatorRole === USER_ROLES.USER ||
    !creatorRole
  ) {
    if (hasClinicId) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: [
          "Do not supply clinicId for this creator role, no clinic link is created on patient create",
        ],
      });
    }
    return;
  }

  if (creatorRole === USER_ROLES.MANAGER) {
    if (!creatorEntityId) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: ["Manager profile missing for this caller"],
      });
    }

    const cid = clinicIdBody;
    if (!cid || String(cid).trim() === "") {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: ["clinicId is required when a manager creates a patient"],
      });
    }
    await assertManagerEffectiveClinicAccess(tx, creatorEntityId, cid);

    const clinic = await tx.clinic.findFirst({
      where: { id: cid, deleted: false },
      select: { id: true },
    });
    if (!clinic) {
      throw httpError({
        error: API_ERRORS.NOT_FOUND,
        details: [`Clinic does not exist: ${cid}`],
      });
    }

    await tx.patientClinic.upsert({
      where: {
        patientId_clinicId: { patientId, clinicId: cid },
      },
      update: {},
      create: {
        patientId,
        clinicId: cid,
        source: PATIENT_RELATION_SOURCE.CLINIC_CREATE,
      },
    });
    return;
  }

  if (creatorRole === USER_ROLES.SPECIALIST) {
    if (hasClinicId) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: [
          "Specialist-created patients derive clinic linkage from specialist links only; omit clinicId",
        ],
      });
    }
    if (!creatorEntityId) {
      throw httpError({
        error: API_ERRORS.FORBIDDEN,
        details: ["Specialist profile missing for this caller"],
      });
    }

    const specialistId = creatorEntityId;
    const specialist = await tx.specialist.findFirst({
      where: { id: specialistId, deleted: false },
      select: { id: true, workingType: true },
    });
    if (!specialist) {
      throw httpError({
        error: API_ERRORS.NOT_FOUND,
        details: [`Specialist does not exist: ${specialistId}`],
      });
    }

    const isFreelance = specialist.workingType === WORKING_TYPES.FREELANCE;

    await tx.patientSpecialist.upsert({
      where: {
        patientId_specialistId: { patientId, specialistId },
      },
      update: {},
      create: {
        patientId,
        specialistId,
        source: isFreelance
          ? PATIENT_RELATION_SOURCE.SPECIALIST_FREELANCE_CREATE
          : PATIENT_RELATION_SOURCE.SPECIALIST_FULLTIME_CREATE,
      },
    });

    if (isFreelance) {
      return;
    }

    const links = await tx.clinicSpecialistLink.findMany({
      where: {
        specialistId,
        status: "ACTIVE",
        clinic: { deleted: false },
      },
      select: { clinicId: true, associationType: true, isPrimary: true },
    });

    const primary =
      links.find((l) => l.isPrimary && l.associationType === "FULL_TIME") ??
      links.find((l) => l.associationType === "FULL_TIME");

    if (!primary?.clinicId) {
      throw httpError({
        error: API_ERRORS.CONFLICT,
        details: [
          "Full-time specialist has no ACTIVE primary FULL_TIME clinic link; cannot derive PatientClinic",
        ],
      });
    }

    await tx.patientClinic.upsert({
      where: {
        patientId_clinicId: {
          patientId,
          clinicId: primary.clinicId,
        },
      },
      update: {},
      create: {
        patientId,
        clinicId: primary.clinicId,
        source: PATIENT_RELATION_SOURCE.SPECIALIST_FULLTIME_CREATE,
      },
    });
    return;
  }

  throw httpError({
    error: API_ERRORS.FORBIDDEN,
    details: [
      "Patient create junction wiring supports ADMIN / PATIENT, MANAGER (requires scoped `clinicId`), or SPECIALIST only.",
      ...(creatorRole ? [`Got role ${creatorRole}`] : ["Missing creator role"]),
    ],
  });
}
