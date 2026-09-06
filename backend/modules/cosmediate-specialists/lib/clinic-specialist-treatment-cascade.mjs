import { WORKING_TYPES } from "/opt/nodejs/constants/domain/shared.constants.mjs";

/**
 * @typedef {object} ClinicLinkSyncResult
 * @property {string[]} leftClinicIds - Clinics removed from the specialist's active roster.
 * @property {string[]} joinedClinicIds - Clinics newly added or re-activated (not previously ACTIVE).
 * @property {string[]} deactivatedAssignmentIds - ClinicSpecialistTreatment ids set to INACTIVE.
 * @property {string[]} reactivatedAssignmentIds - ClinicSpecialistTreatment ids set back to ACTIVE.
 */

/**
 * Compares current clinic links against the desired target set.
 *
 * Used before any writes so we know which clinics the specialist is leaving vs joining.
 * "Left" means currently ACTIVE but absent from `targetClinicIds` (freelance remove or FT transfer away).
 * "Joined" means in `targetClinicIds` but not currently ACTIVE — either a brand-new clinic or a
 * re-attach of a clinic whose link was previously INACTIVE.
 *
 * Does not mutate data.
 *
 * @param {Array<{ clinicId: string, status: string }>} existingLinks - All links (ACTIVE + INACTIVE).
 * @param {string[]} targetClinicIds - Desired ACTIVE clinic ids after sync.
 * @returns {{ leftClinicIds: string[], joinedClinicIds: string[], existingByClinic: Map<string, object> }}
 */
export const diffClinicLinkTargets = (existingLinks, targetClinicIds) => {
  const existingByClinic = new Map(
    existingLinks.map((link) => [link.clinicId, link]),
  );
  const targetSet = new Set(targetClinicIds);
  const activeClinicIds = new Set(
    existingLinks
      .filter((link) => link.status === "ACTIVE")
      .map((link) => link.clinicId),
  );

  const leftClinicIds = [...activeClinicIds].filter((id) => !targetSet.has(id));
  const joinedClinicIds = targetClinicIds.filter(
    (id) => !activeClinicIds.has(id),
  );

  return { leftClinicIds, joinedClinicIds, existingByClinic };
};

/**
 * Soft-offers specialist treatment assignments when they leave a clinic.
 *
 * Sets `ClinicSpecialistTreatment.status` → INACTIVE for every ACTIVE, non-deleted row
 * matching `(specialistId, clinicId ∈ clinicIds)`. Does **not** delete rows and does **not**
 * touch `ClinicTreatment`, `SubTreatment`, or `TreatmentResult` at that clinic — clinic-owned
 * data stays put per Phase 6 rules.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {string} specialistId
 * @param {string[]} clinicIds - Clinics the specialist is leaving.
 * @returns {Promise<string[]>} Assignment ids at those clinics (for OS reindex).
 */
export const deactivateAssignmentsForClinics = async (
  tx,
  specialistId,
  clinicIds,
) => {
  if (!clinicIds.length) return [];

  await tx.clinicSpecialistTreatment.updateMany({
    where: {
      specialistId,
      clinicId: { in: clinicIds },
      status: "ACTIVE",
      deleted: false,
    },
    data: { status: "INACTIVE" },
  });

  const rows = await tx.clinicSpecialistTreatment.findMany({
    where: {
      specialistId,
      clinicId: { in: clinicIds },
      deleted: false,
    },
    select: { id: true },
  });

  return rows.map((row) => row.id);
};

/**
 * Restores prior assignments when a specialist re-attaches a clinic they had before.
 *
 * Only flips **existing** INACTIVE `ClinicSpecialistTreatment` rows back to ACTIVE.
 * Never creates new assignments — a genuinely new clinic link starts with zero offerings;
 * the clinic manager must assign treatments fresh (no copy from another clinic).
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {string} specialistId
 * @param {string[]} clinicIds - Clinics being re-joined (must have had a link row before).
 * @returns {Promise<string[]>} Assignment ids now ACTIVE at those clinics (for OS reindex).
 */
export const reactivateAssignmentsForClinics = async (
  tx,
  specialistId,
  clinicIds,
) => {
  if (!clinicIds.length) return [];

  await tx.clinicSpecialistTreatment.updateMany({
    where: {
      specialistId,
      clinicId: { in: clinicIds },
      status: "INACTIVE",
      deleted: false,
    },
    data: { status: "ACTIVE" },
  });

  const rows = await tx.clinicSpecialistTreatment.findMany({
    where: {
      specialistId,
      clinicId: { in: clinicIds },
      status: "ACTIVE",
      deleted: false,
    },
    select: { id: true },
  });

  return rows.map((row) => row.id);
};

/**
 * Main entry: diff-based `ClinicSpecialistLink` sync + assignment cascade in one transaction.
 *
 * **Full-time transfer** (A → B): link A INACTIVE, link B ACTIVE, assignments at A INACTIVE,
 * no assignments copied to B.
 *
 * **Freelance remove clinic**: same as leaving — link + assignments INACTIVE at that clinic.
 *
 * **Re-attach same clinic** (link was INACTIVE): link ACTIVE again; prior INACTIVE assignments
 * at that clinic re-activate.
 *
 * **Brand-new clinic** (no prior link row): creates ACTIVE link only; assignments stay empty
 * until the clinic manager runs assignment sync (P6.4).
 *
 * Link rows are never hard-deleted — only status / isPrimary / associationType are updated.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {object} params
 * @param {string} params.specialistId
 * @param {string} params.workingType - `FULL_TIME` | `FREELANCE` (sets associationType + primary).
 * @param {string[]} params.targetClinicIds - Full desired ACTIVE clinic set after this update.
 * @returns {Promise<ClinicLinkSyncResult>}
 */
export const syncSpecialistClinicLinksInTx = async (
  tx,
  { specialistId, workingType, targetClinicIds },
) => {
  const existingLinks = await tx.clinicSpecialistLink.findMany({
    where: { specialistId },
    select: {
      clinicId: true,
      status: true,
      associationType: true,
      isPrimary: true,
    },
  });

  const { leftClinicIds, joinedClinicIds, existingByClinic } =
    diffClinicLinkTargets(existingLinks, targetClinicIds);

  const associationType =
    workingType === WORKING_TYPES.FULL_TIME ? "FULL_TIME" : "FREELANCE";

  if (leftClinicIds.length) {
    await tx.clinicSpecialistLink.updateMany({
      where: { specialistId, clinicId: { in: leftClinicIds } },
      data: { status: "INACTIVE", isPrimary: false },
    });
  }

  for (const [index, clinicId] of targetClinicIds.entries()) {
    const isPrimary = workingType === WORKING_TYPES.FULL_TIME && index === 0;
    const existing = existingByClinic.get(clinicId);

    if (existing) {
      await tx.clinicSpecialistLink.update({
        where: { clinicId_specialistId: { clinicId, specialistId } },
        data: {
          status: "ACTIVE",
          associationType,
          isPrimary,
        },
      });
    } else {
      await tx.clinicSpecialistLink.create({
        data: {
          specialistId,
          clinicId,
          associationType,
          isPrimary,
          status: "ACTIVE",
        },
      });
    }
  }

  const deactivatedAssignmentIds = await deactivateAssignmentsForClinics(
    tx,
    specialistId,
    leftClinicIds,
  );

  // Only re-activate assignments for re-joins (had a link before), not net-new clinics.
  const reactivateClinicIds = joinedClinicIds.filter((id) =>
    existingByClinic.has(id),
  );
  const reactivatedAssignmentIds = await reactivateAssignmentsForClinics(
    tx,
    specialistId,
    reactivateClinicIds,
  );

  return {
    leftClinicIds,
    joinedClinicIds,
    deactivatedAssignmentIds,
    reactivatedAssignmentIds,
  };
};
