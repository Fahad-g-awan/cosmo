import { resolveClinicOrgIds } from "../../../services/prisma/org/clinic/org.mjs";
import { dedupeEmails } from "./email-utils.mjs";

/**
 * Resolve manager identity emails by manager IDs.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string[]} managerIds
 * @returns {Promise<string[]>}
 */
export const resolveManagerEmailsByIds = async (prisma, managerIds = []) => {
  if (!managerIds.length) return [];

  const managers = await prisma.clinicManager.findMany({
    where: { id: { in: managerIds }, deleted: false },
    include: {
      identity: { select: { email: true } },
    },
  });

  return dedupeEmails(
    managers.map((manager) => manager.identity?.email).filter(Boolean),
  );
};

/**
 * Active managers on a clinic and its parent-org clinics.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} clinicId
 * @returns {Promise<string[]>}
 */
export const resolveClinicStakeholderEmails = async (prisma, clinicId) => {
  if (!clinicId) return [];

  const { orgClinicIds } = await resolveClinicOrgIds(prisma, clinicId);

  const links = await prisma.clinicManagerLink.findMany({
    where: {
      clinicId: { in: orgClinicIds },
      manager: { deleted: false },
    },
    include: {
      manager: {
        include: {
          identity: { select: { email: true } },
        },
      },
    },
  });

  return dedupeEmails(
    links.map((link) => link.manager?.identity?.email).filter(Boolean),
  );
};

/**
 * Union stakeholder emails across multiple clinics (deduped).
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string[]} clinicIds
 * @returns {Promise<string[]>}
 */
export const resolveClinicIdsStakeholderEmails = async (prisma, clinicIds = []) => {
  const emails = [];

  for (const clinicId of clinicIds) {
    const clinicEmails = await resolveClinicStakeholderEmails(prisma, clinicId);
    emails.push(...clinicEmails);
  }

  return dedupeEmails(emails);
};

/**
 * Resolve a specialist's identity email by specialist ID.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} specialistId
 * @returns {Promise<string[]>}
 */
export const resolveSpecialistEmailsByIds = async (prisma, specialistIds = []) => {
  if (!specialistIds.length) return [];

  const specialists = await prisma.specialist.findMany({
    where: { id: { in: specialistIds }, deleted: false },
    include: { identity: { select: { email: true } } },
  });

  return dedupeEmails(
    specialists.map((specialist) => specialist.identity?.email).filter(Boolean),
  );
};

/**
 * Clinic manager stakeholders for all clinics linked to a specialist.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} specialistId
 * @returns {Promise<string[]>}
 */
export const resolveSpecialistClinicStakeholderEmails = async (
  prisma,
  specialistId,
) => {
  if (!specialistId) return [];

  const links = await prisma.clinicSpecialistLink.findMany({
    where: {
      specialistId,
      status: "ACTIVE",
      clinic: { deleted: false },
    },
    select: { clinicId: true },
  });

  const clinicIds = links.map((link) => link.clinicId).filter(Boolean);
  return resolveClinicIdsStakeholderEmails(prisma, clinicIds);
};

/**
 * Union clinic manager stakeholders across multiple specialist IDs.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string[]} specialistIds
 * @returns {Promise<string[]>}
 */
export const resolveSpecialistIdsStakeholderEmails = async (
  prisma,
  specialistIds = [],
) => {
  const emails = [];

  for (const specialistId of specialistIds) {
    const specialistEmails = await resolveSpecialistClinicStakeholderEmails(
      prisma,
      specialistId,
    );
    emails.push(...specialistEmails);
  }

  return dedupeEmails(emails);
};

/**
 * Stakeholder emails for a review target (clinic managers or specialist + linked clinics).
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {"CLINIC"|"SPECIALIST"|string} targetEntityType
 * @param {string} targetEntityId
 * @returns {Promise<string[]>}
 */
export const resolveReviewTargetStakeholderEmails = async (
  prisma,
  targetEntityType,
  targetEntityId,
) => {
  if (!targetEntityId) return [];

  if (targetEntityType === "CLINIC") {
    return resolveClinicStakeholderEmails(prisma, targetEntityId);
  }

  const specialistEmails = await resolveSpecialistEmailsByIds(prisma, [
    targetEntityId,
  ]);
  const clinicStakeholders = await resolveSpecialistClinicStakeholderEmails(
    prisma,
    targetEntityId,
  );

  return dedupeEmails([...specialistEmails, ...clinicStakeholders]);
};
