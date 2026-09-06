import { loadSpecialistTreatmentFacets } from "/opt/nodejs/services/prisma/org/treatment/treatment-price-aggregates.mjs";
import { USER_ROLES } from "/opt/nodejs/constants/auth/roles.constants.mjs";

const specialistDetailInclude = {
  identity: {
    select: {
      id: true,
      email: true,
      phone: true,
      status: true,
      role: true,
      perms: true,
      cognitoSub: true,
      defaultPasswordUsed: true,
      passwordSet: true,
      linkedProviders: true,
      entityId: true,
    },
  },
  clinics: {
    where: {
      status: "ACTIVE",
      clinic: { deleted: false },
    },
    select: {
      clinicId: true,
      associationType: true,
      isPrimary: true,
      status: true,
      clinic: {
        select: {
          id: true,
          name: true,
          email: true,
          logo: true,
          city: true,
          state: true,
          country: true,
          avgRating: true,
          reviewCount: true,
          status: true,
        },
      },
    },
  },
  clinicSpecialistTreatments: {
    where: { deleted: false },
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
          logo: true,
          avgRating: true,
          reviewCount: true,
          completeAddress: true,
        },
      },
      clinicTreatment: {
        include: {
          treatment: {
            select: {
              id: true,
              name: true,
              image: true,
              overview: true,
              category: { select: { id: true, name: true } },
            },
          },
          subTreatments: {
            where: { deleted: false },
            include: {
              brands: {
                include: {
                  brand: { select: { id: true, name: true } },
                },
              },
            },
          },
          treatmentResults: {
            where: { deleted: false },
            select: {
              id: true,
              beforeImage: true,
              afterImage: true,
              description: true,
              createdAt: true,
            },
          },
          _count: { select: { subTreatments: true } },
        },
      },
    },
  },
  _count: {
    select: {
      clinics: true,
      clinicSpecialistTreatments: true,
    },
  },
};

/**
 * Rejects duplicate specialist emails (Identity + non-deleted Specialist profile).
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} email
 */
export const validateSpecialistEmail = async (prisma, email) => {
  const existing = await prisma.identity.findUnique({
    where: { email: email.toLowerCase() },
    include: { specialist: true },
  });

  if (existing?.specialist && !existing.specialist.deleted) {
    return { ok: false, errors: [`Specialist already exists: ${email}`] };
  }

  return { ok: true, errors: [] };
};

/**
 * Loads a specialist with identity, clinic links, and treatment offerings.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} specialistId
 */
export const getSpecialistById = async (prisma, specialistId) => {
  if (!specialistId) {
    return {
      specialist: null,
      errors: ["Specialist ID not provided"],
      ok: false,
    };
  }

  const foundSpecialist = await prisma.specialist.findFirst({
    where: { id: specialistId, deleted: false },
    include: specialistDetailInclude,
  });

  if (!foundSpecialist) {
    return {
      errors: [`Specialist does not exist: ${specialistId}`],
      specialist: null,
      ok: false,
    };
  }

  const facets = await loadSpecialistTreatmentFacets(prisma, specialistId);

  return {
    errors: [],
    specialist: {
      ...foundSpecialist,
      minPrice: facets.minPrice,
      maxPrice: facets.maxPrice,
      avgPrice: facets.avgPrice,
      treatmentCount: facets.treatmentCount,
    },
    ok: true,
  };
};

export const resolvePrimaryClinicLink = (links = []) => {
  return (
    links.find(
      (l) =>
        l.isPrimary &&
        l.associationType === "FULL_TIME" &&
        l.status === "ACTIVE",
    ) ??
    links.find(
      (l) => l.associationType === "FULL_TIME" && l.status === "ACTIVE",
    ) ??
    null
  );
};

export const resolveParentClinicId = (links = []) =>
  resolvePrimaryClinicLink(links)?.clinicId ?? null;

export const resolveClinicIds = (links = []) =>
  links.map((l) => l.clinicId).filter(Boolean);

export const resolveSpecialistRole = (identity) =>
  identity?.role ?? USER_ROLES.SPECIALIST;
