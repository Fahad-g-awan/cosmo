const managerDetailInclude = {
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
    where: { clinic: { deleted: false } },
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
          email: true,
          logo: true,
          city: true,
          status: true,
          completeAddress: true,
          clinicType: true,
          parentClinicId: true,
        },
      },
    },
  },
  _count: { select: { clinics: true } },
};

export const validateManagerEmail = async (prisma, email) => {
  const existing = await prisma.identity.findUnique({
    where: { email: email.toLowerCase() },
    include: { clinicManager: true },
  });

  if (existing?.clinicManager && !existing.clinicManager.deleted) {
    return {
      ok: false,
      errors: [
        "A manager account with this email already exists. Please use a different email address.",
      ],
    };
  }

  return { ok: true, errors: [] };
};

export const getManagerById = async (prisma, managerId) => {
  if (!managerId) {
    return { manager: null, errors: ["Manager ID not provided"], ok: false };
  }

  const manager = await prisma.clinicManager.findFirst({
    where: { id: managerId, deleted: false },
    include: managerDetailInclude,
  });

  if (!manager) {
    return {
      errors: [`Manager does not exist: ${managerId}`],
      manager: null,
      ok: false,
    };
  }

  return { errors: [], manager, ok: true };
};

export const getManagersByIds = async (prisma, managerIds) => {
  if (!managerIds?.length) {
    return { managers: [], errors: [], ok: false };
  }

  const managers = await prisma.clinicManager.findMany({
    where: { id: { in: managerIds }, deleted: false },
    select: {
      id: true,
      identityId: true,
      fullName: true,
      image: true,
      identity: {
        select: { email: true, status: true, role: true },
      },
    },
  });

  const foundIds = managers.map((m) => m.id);
  const missingIds = managerIds.filter((id) => !foundIds.includes(id));
  const errors = missingIds.map((id) => `Manager does not exist: ${id}`);

  return { managers, errors, ok: errors.length === 0 };
};
