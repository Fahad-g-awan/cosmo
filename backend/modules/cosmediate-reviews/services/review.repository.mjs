/**
 * Resolve a review/reply author by profile-table id (`authorId`).
 * Email/phone live on `Identity`; profile rows are merged for denormalized fields.
 */
export const findAuthorById = async (prisma, profileId) => {
  if (!profileId) {
    return { user: null, errors: ["User ID not provided"], ok: false };
  }

  const include = {
    include: {
      identity: { select: { email: true, phone: true } },
    },
  };

  for (const table of ["patient", "admin", "specialist", "clinicManager"]) {
    const row = await prisma[table].findFirst({
      where: { id: profileId, deleted: false },
      ...include,
    });

    if (row) {
      const { identity, ...profile } = row;
      return {
        errors: [],
        user: {
          ...profile,
          email: identity?.email ?? profile.email ?? null,
          phone: identity?.phone ?? profile.phone ?? null,
        },
        ok: true,
      };
    }
  }

  return {
    errors: [`User does not exist: ${profileId}`],
    user: null,
    ok: false,
  };
};

export const findTargetEntity = async (
  prisma,
  targetEntityType,
  targetEntityId,
) => {
  if (!targetEntityId || !targetEntityType) {
    return {
      errors: ["Target entity type and ID are required"],
      foundEntity: null,
      ok: false,
    };
  }

  const isClinic = targetEntityType === "CLINIC";
  let foundEntity = isClinic
    ? await prisma.clinic.findUnique({
        where: { id: targetEntityId, deleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          logo: true,
          completeAddress: true,
        },
      })
    : await prisma.specialist.findUnique({
        where: { id: targetEntityId, deleted: false },
        select: {
          id: true,
          fullName: true,
          image: true,
          completeAddress: true,
          identity: { select: { email: true } },
        },
      });

  if (!foundEntity) {
    return {
      errors: [
        `${isClinic ? "Clinic" : "Specialist"} does not exist: ${targetEntityId}`,
      ],
      foundEntity: null,
      ok: false,
    };
  }

  if (!isClinic) {
    const { identity, ...profile } = foundEntity;
    foundEntity = {
      ...profile,
      email: identity?.email ?? null,
    };
  }

  return { errors: [], foundEntity, ok: true };
};

export const findReviewById = async (prisma, reviewId) => {
  if (!reviewId) {
    return { errors: ["Review ID is required"], review: null, ok: false };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId, deleted: false },
    include: {
      replies: {
        where: { deleted: false },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!review) {
    return { errors: [`Review does not exist: ${reviewId}`], review: null, ok: false };
  }

  return { errors: [], review, ok: true };
};

export const findReviewReplyById = async (prisma, replyId) => {
  if (!replyId) {
    return {
      errors: ["Review reply ID is required"],
      reply: null,
      ok: false,
    };
  }

  const reply = await prisma.reviewReply.findUnique({
    where: { id: replyId, deleted: false },
  });

  if (!reply) {
    return {
      errors: [`Review reply does not exist: ${replyId}`],
      reply: null,
      ok: false,
    };
  }

  return { errors: [], reply, ok: true };
};

export const createReviewRecord = async (prisma, data) =>
  prisma.review.create({ data });

export const updateReviewRecord = async (prisma, id, data) =>
  prisma.review.update({ where: { id }, data });

export const softDeleteReviewRecord = async (prisma, id) =>
  prisma.review.update({
    where: { id },
    data: { deleted: true, deletedAt: new Date() },
  });

export const createReviewReplyRecord = async (prisma, data) =>
  prisma.reviewReply.create({ data });

export const updateReviewReplyRecord = async (prisma, id, data) =>
  prisma.reviewReply.update({ where: { id }, data });

export const softDeleteReviewReplyRecord = async (prisma, id) =>
  prisma.reviewReply.update({
    where: { id },
    data: { deleted: true, deletedAt: new Date() },
  });

export const incrementReviewReplyCount = async (prisma, reviewId) =>
  prisma.review.update({
    where: { id: reviewId },
    data: { replyCount: { increment: 1 } },
  });

export const decrementReviewReplyCount = async (prisma, reviewId) =>
  prisma.review.update({
    where: { id: reviewId },
    data: { replyCount: { decrement: 1 } },
  });
