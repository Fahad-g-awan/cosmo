import { ANNOUNCEMENT_STATUS } from "/opt/nodejs/constants/domain/announcement.constants.mjs";
const buildScheduleWindowOr = (now) => [
  { AND: [{ startsAt: null }, { endsAt: null }] },
  { AND: [{ startsAt: { lte: now } }, { endsAt: null }] },
  { AND: [{ startsAt: null }, { endsAt: { gte: now } }] },
  { AND: [{ startsAt: { lte: now } }, { endsAt: { gte: now } }] },
];

export const buildActiveAnnouncementWhere = ({
  surface,
  role = null,
  identityId = null,
  now = new Date(),
}) => {
  const where = {
    deleted: false,
    status: ANNOUNCEMENT_STATUS.ACTIVE,
    OR: buildScheduleWindowOr(now),
    AND: [
      {
        OR: [
          { targetSurfaces: { isEmpty: true } },
          { targetSurfaces: { has: surface } },
        ],
      },
    ],
  };

  if (role) {
    where.AND.push({
      OR: [
        { targetRoles: { isEmpty: true } },
        { targetRoles: { has: role } },
      ],
    });
  }

  if (identityId) {
    where.dismissals = { none: { identityId } };
  }

  return where;
};

export const getAnnouncementById = async (prisma, announcementId) => {
  if (!announcementId) {
    return {
      announcement: null,
      errors: ["Announcement ID not provided"],
      ok: false,
    };
  }

  const announcement = await prisma.announcement.findFirst({
    where: { id: announcementId, deleted: false },
  });

  if (!announcement) {
    return {
      announcement: null,
      errors: [`Announcement does not exist: ${announcementId}`],
      ok: false,
    };
  }

  return { announcement, errors: [], ok: true };
};

export const listActiveAnnouncements = async (
  prisma,
  { surface, role = null, identityId = null },
) =>
  prisma.announcement.findMany({
    where: buildActiveAnnouncementWhere({ surface, role, identityId }),
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
