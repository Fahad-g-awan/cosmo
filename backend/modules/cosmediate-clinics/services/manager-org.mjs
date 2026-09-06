import {
  assertManagerEffectiveClinicAccess,
  resolveManagerEffectiveClinicIds,
  resolveManagerOrgRootId,
} from "/opt/nodejs/services/prisma/org/manager/effective-scope.mjs";
import { resolveClinicOrgIds } from "/opt/nodejs/services/prisma/org/clinic/org.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

export {
  assertManagerEffectiveClinicAccess,
  resolveManagerEffectiveClinicIds,
  resolveManagerOrgRootId,
};

/**
 * Expand a clinic id to all branch ids in the same org (for manager list scope).
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} clinicId
 */
export const resolveManagerScopeFromClinic = async (prisma, clinicId) => {
  const { orgClinicIds } = await resolveClinicOrgIds(prisma, clinicId);
  return orgClinicIds;
};

/**
 * Every manager must either be brand-new (no org) or share the target clinic's org root.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string[]} managerIds
 * @param {string} targetClinicId
 */
export const assertManagersInClinicOrg = async (
  prisma,
  managerIds,
  targetClinicId,
) => {
  if (!Array.isArray(managerIds) || !managerIds.length) return;

  const { rootId } = await resolveClinicOrgIds(prisma, targetClinicId);
  const offenders = [];

  for (const managerId of managerIds) {
    const managerRoot = await resolveManagerOrgRootId(prisma, managerId);
    if (managerRoot !== rootId) offenders.push(managerId);
  }

  if (offenders.length) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "All managers attached to a clinic must belong to the same organization",
        `Managers must already be linked to the target clinic organization (root: ${rootId})`,
        `Invalid manager ids: ${offenders.join(", ")}`,
      ],
    });
  }
};

/**
 * Validates that all clinics belong to one org (used when bootstrapping a new manager).
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string[]} clinicIds
 */
export const assertClinicsShareOrg = async (prisma, clinicIds) => {
  if (!clinicIds?.length) return;

  const anchorClinicId = clinicIds[0];
  const { rootId: anchorRoot } = await resolveClinicOrgIds(
    prisma,
    anchorClinicId,
  );

  const conflicting = [];
  for (const cid of clinicIds.slice(1)) {
    const { rootId } = await resolveClinicOrgIds(prisma, cid);
    if (rootId !== anchorRoot) conflicting.push(cid);
  }

  if (conflicting.length) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "All clinics passed to a new manager must belong to the same organization",
        `Anchor org root: ${anchorRoot}`,
        `Out-of-org clinic ids: ${conflicting.join(", ")}`,
      ],
    });
  }
};
