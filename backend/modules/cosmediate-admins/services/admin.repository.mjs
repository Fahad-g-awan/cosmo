export const countActiveAdmins = async (prisma) =>
  prisma.admin.count({ where: { deleted: false } });

export const validateAdminEmailAvailable = async (prisma, email) => {
  const errors = [];
  const existing = await prisma.identity.findUnique({
    where: { email: email.toLowerCase() },
    include: { admin: true },
  });

  if (existing?.admin && !existing.admin.deleted) {
    errors.push(`Admin already exists: ${email}`);
  }

  return {
    errors,
    foundAdmin: existing?.admin ?? null,
    ok: errors.length === 0,
  };
};

export const getAdminById = async (prisma, adminId) => {
  if (!adminId) {
    return { admin: null, errors: ["Admin ID not provided"], ok: false };
  }

  const admin = await prisma.admin.findFirst({
    where: { id: adminId, deleted: false },
    include: { identity: true },
  });

  if (!admin) {
    return {
      errors: [`Admin does not exist: ${adminId}`],
      admin: null,
      ok: false,
    };
  }

  return { errors: [], admin, ok: true };
};

export const getAdminByIdWithIdentity = async (prisma, adminId) => {
  const result = await getAdminById(prisma, adminId);
  return result;
};
