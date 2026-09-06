/** Clinic reads used by specialist create/update — local to this lambda. */

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
