import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../../lib/errors/http-error.mjs";
import { resolveClinicOrgIds } from "../clinic/org.mjs";

/**
 * @param {{ clinic: { id: string, clinicType: string, parentClinicId: string | null, deleted: boolean } }[]} liveLinks
 */
const deriveManagerOrgRootIdFromLiveLinks = (liveLinks, managerIdForError) => {
  if (!liveLinks.length) return null;

  const roots = new Set(
    liveLinks.map((l) =>
      l.clinic.clinicType === "PARENT"
        ? l.clinic.id
        : (l.clinic.parentClinicId ?? l.clinic.id),
    ),
  );

  if (roots.size > 1) {
    throw httpError({
      error: API_ERRORS.CONFLICT,
      details: [
        `Manager ${managerIdForError} is linked to clinics across multiple organizations`,
        "This violates the single-org invariant; resolve manually before further changes",
      ],
    });
  }

  return [...roots][0];
};

export const resolveManagerOrgRootId = async (db, managerId) => {
  if (!managerId) return null;

  const links = await db.clinicManagerLink.findMany({
    where: { managerId, manager: { deleted: false } },
    select: {
      clinic: {
        select: {
          id: true,
          clinicType: true,
          parentClinicId: true,
          deleted: true,
        },
      },
    },
  });

  const liveLinks = links.filter((l) => l.clinic && !l.clinic.deleted);

  return deriveManagerOrgRootIdFromLiveLinks(liveLinks, managerId);
};

/** Manager effective scope (`db` may be prisma or `$transaction` delegate). */
export const resolveManagerEffectiveClinicIds = async (db, managerId) => {
  if (!managerId) {
    return { effectiveClinicIds: [], rootId: null, orgWide: false };
  }

  const links = await db.clinicManagerLink.findMany({
    where: { managerId, manager: { deleted: false } },
    select: {
      clinicId: true,
      clinic: {
        select: {
          id: true,
          clinicType: true,
          parentClinicId: true,
          deleted: true,
        },
      },
    },
  });

  const liveLinks = links.filter((l) => l.clinic && !l.clinic.deleted);
  if (!liveLinks.length) {
    return { effectiveClinicIds: [], rootId: null, orgWide: false };
  }

  const rootId = deriveManagerOrgRootIdFromLiveLinks(liveLinks, managerId);

  const orgWide = liveLinks.some((l) => l.clinic.clinicType === "PARENT");
  if (orgWide) {
    const { orgClinicIds } = await resolveClinicOrgIds(db, rootId);
    return { effectiveClinicIds: orgClinicIds, rootId, orgWide: true };
  }

  return {
    effectiveClinicIds: [...new Set(liveLinks.map((l) => l.clinicId))],
    rootId,
    orgWide: false,
  };
};

/** Throws via `httpError({ error: API_ERRORS.FORBIDDEN })` unless `clinicId` is in manager's effective scope. */
export const assertManagerEffectiveClinicAccess = async (
  db,
  managerId,
  clinicId,
) => {
  if (!clinicId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["clinicId is required"],
    });
  }
  const { effectiveClinicIds } = await resolveManagerEffectiveClinicIds(
    db,
    managerId,
  );
  if (!effectiveClinicIds.includes(clinicId)) {
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      details: ["Manager scope does not include this clinic"],
    });
  }
};
