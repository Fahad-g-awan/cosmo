const mapAnnouncementFields = (announcement) => {
  if (!announcement) return null;

  return {
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    severity: announcement.severity,
    status: announcement.status,
    priority: announcement.priority,
    startsAt: announcement.startsAt,
    endsAt: announcement.endsAt,
    dismissible: announcement.dismissible,
    targetRoles: announcement.targetRoles ?? [],
    targetSurfaces: announcement.targetSurfaces ?? [],
    actionLabel: announcement.actionLabel ?? null,
    actionUrl: announcement.actionUrl ?? null,
    searchClicks: announcement.searchClicks ?? 0,
    entityType: announcement.entityType,
    authorId: announcement.authorId,
    authorName: announcement.authorName,
    authorEmail: announcement.authorEmail,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  };
};

export const toAnnouncementDto = (announcement) =>
  mapAnnouncementFields(announcement);

export const toAnnouncementListDto = (items = []) =>
  items.map((item) => mapAnnouncementFields(item));

export const toActiveAnnouncementDto = (announcement) => {
  const dto = mapAnnouncementFields(announcement);
  if (!dto) return null;

  return {
    source: "announcement",
    id: dto.id,
    title: dto.title,
    message: dto.message,
    severity: dto.severity,
    dismissible: dto.dismissible,
    priority: dto.priority,
    action:
      dto.actionLabel && dto.actionUrl
        ? { label: dto.actionLabel, href: dto.actionUrl }
        : null,
  };
};

export const toActiveAnnouncementListDto = (items = []) =>
  items.map((item) => toActiveAnnouncementDto(item)).filter(Boolean);
