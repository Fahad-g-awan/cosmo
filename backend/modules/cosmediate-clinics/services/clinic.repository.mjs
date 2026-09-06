import { loadClinicTreatmentFacets } from "/opt/nodejs/services/prisma/org/treatment/treatment-price-aggregates.mjs";

const clinicDetailInclude = {
  categories: { include: { category: true } },
  managers: {
    where: { manager: { deleted: false } },
    include: {
      manager: {
        select: {
          id: true,
          fullName: true,
          image: true,
          identity: { select: { email: true, status: true, role: true } },
        },
      },
    },
  },
  specialists: {
    where: { specialist: { deleted: false } },
    include: {
      specialist: {
        select: {
          id: true,
          fullName: true,
          image: true,
          status: true,
          avgRating: true,
          reviewCount: true,
          identity: { select: { email: true, status: true, role: true } },
        },
      },
    },
  },
  clinicSpecialistTreatments: {
    where: { deleted: false },
    include: {
      specialist: {
        select: {
          id: true,
          fullName: true,
          image: true,
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
              brands: { include: { brand: { select: { id: true, name: true } } } },
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
      managers: true,
      specialists: true,
      clinicSpecialistTreatments: true,
    },
  },
};

export const validateClinicEmail = async (prisma, email) => {
  const found = await prisma.clinic.findFirst({
    where: { email: email.toLowerCase(), deleted: false },
  });
  if (found) {
    return {
      ok: false,
      errors: ["A clinic with this email address already exists."],
    };
  }
  return { ok: true, errors: [] };
};

export const getClinicById = async (prisma, clinicId) => {
  if (!clinicId) {
    return { clinic: null, errors: ["Clinic ID not provided"], ok: false };
  }

  const clinic = await prisma.clinic.findFirst({
    where: { id: clinicId, deleted: false },
    include: clinicDetailInclude,
  });

  if (!clinic) {
    return {
      errors: [`Clinic does not exist: ${clinicId}`],
      clinic: null,
      ok: false,
    };
  }

  const facets = await loadClinicTreatmentFacets(prisma, clinicId);

  return {
    errors: [],
    clinic: {
      ...clinic,
      minPrice: facets.minPrice,
      maxPrice: facets.maxPrice,
      avgPrice: facets.avgPrice,
    },
    ok: true,
  };
};

export const getClinicsByIds = async (prisma, clinicIds) => {
  if (!clinicIds?.length) return { clinics: [], errors: [], ok: false };

  const clinics = await prisma.clinic.findMany({
    where: { id: { in: clinicIds }, deleted: false },
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
  });

  const foundIds = clinics.map((c) => c.id);
  const missingIds = clinicIds.filter((id) => !foundIds.includes(id));
  const errors = missingIds.map((id) => `Clinic does not exist: ${id}`);

  return { errors, clinics, ok: errors.length === 0 };
};

export { resolveClinicOrgIds } from "/opt/nodejs/services/prisma/org/clinic/org.mjs";
