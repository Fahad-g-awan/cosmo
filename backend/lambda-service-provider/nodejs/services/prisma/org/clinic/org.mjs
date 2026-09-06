import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../../lib/errors/http-error.mjs";

/**
 * Org boundary for any clinic (`Clinic.parentClinicId` chain): root PARENT id plus
 * all NODE rows with `parentClinicId === rootId`.
 *
 * Accepts root Prisma client or interactive transaction delegate (`tx`).
 */
export async function resolveClinicOrgIds(db, clinicId) {
  if (!clinicId) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["clinicId is required"],
    });
  }

  const clinic = await db.clinic.findFirst({
    where: { id: clinicId, deleted: false },
    select: { id: true, clinicType: true, parentClinicId: true },
  });

  if (!clinic) {
    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      details: [`Clinic does not exist: ${clinicId}`],
    });
  }

  const rootId =
    clinic.clinicType === "PARENT"
      ? clinic.id
      : (clinic.parentClinicId ?? clinic.id);

  const orgClinics = await db.clinic.findMany({
    where: {
      deleted: false,
      OR: [{ id: rootId }, { parentClinicId: rootId }],
    },
    select: { id: true },
  });

  return {
    rootId,
    orgClinicIds: orgClinics.map((c) => c.id),
  };
}

/**
 * Resolves unique org root ids for a set of clinic ids (patient index denorm).
 *
 * @param {import("@prisma/client").PrismaClient | import("@prisma/client").Prisma.TransactionClient} db
 * @param {string[]} clinicIds
 * @returns {Promise<string[]>}
 */
export async function resolveOrgRootIdsForClinicIds(db, clinicIds = []) {
  const uniqueIds = [...new Set(clinicIds.filter(Boolean))];
  if (!uniqueIds.length) return [];

  const clinics = await db.clinic.findMany({
    where: { id: { in: uniqueIds }, deleted: false },
    select: { id: true, clinicType: true, parentClinicId: true },
  });

  const rootIds = new Set();
  for (const clinic of clinics) {
    const rootId =
      clinic.clinicType === "PARENT"
        ? clinic.id
        : (clinic.parentClinicId ?? clinic.id);
    rootIds.add(rootId);
  }

  return [...rootIds];
}
