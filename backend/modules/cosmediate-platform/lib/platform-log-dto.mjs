const INTERNAL_KEYS = new Set([
  "PK",
  "SK",
  "GSI1PK",
  "GSI1SK",
  "GSI2PK",
  "GSI2SK",
  "GSI3PK",
  "GSI3SK",
  "GSI4PK",
  "GSI4SK",
  "GSI5PK",
  "GSI5SK",
  "GSI6PK",
  "GSI6SK",
  "GSI7PK",
  "GSI7SK",
  "GSI8PK",
  "GSI8SK",
  "GSI9PK",
  "GSI9SK",
  "GSI10PK",
  "GSI10SK",
  "entityType",
  "deleted",
  "deletedAt",
  "updatedAt",
]);

const stripInternalKeys = (item) => {
  if (!item || typeof item !== "object") return item;
  return Object.fromEntries(
    Object.entries(item).filter(([key]) => !INTERNAL_KEYS.has(key)),
  );
};

export const toAuditLogListItem = (item) => {
  const dto = stripInternalKeys(item);
  return {
    id: dto.id,
    actorId: dto.actorId ?? "",
    actorEmail: dto.actorEmail ?? "",
    actorRole: dto.actorRole ?? "",
    actorDisplayName: dto.actorDisplayName ?? "",
    action: dto.action ?? "",
    entity: dto.entity ?? "",
    clinicId: dto.clinicId ?? null,
    createdAt: dto.createdAt ?? "",
  };
};

export const toAuditLogDetail = (item) => {
  const dto = stripInternalKeys(item);
  return {
    ...toAuditLogListItem(item),
    logData: dto.logData ?? {},
    orgRootId: dto.orgRootId ?? null,
    actorSub: dto.actorSub ?? "",
  };
};

export const toActivityLogListItem = (item) => {
  const dto = stripInternalKeys(item);
  return {
    id: dto.id,
    actorId: dto.actorId ?? "",
    actorDisplayName: dto.actorDisplayName ?? "",
    actorRole: dto.actorRole ?? "",
    action: dto.action ?? "",
    scope: dto.scope ?? "",
    targetEntityId: dto.targetEntityId ?? "",
    targetName: dto.targetName ?? "",
    feedLine: dto.feedLine ?? "",
    clinicId: dto.clinicId ?? null,
    occurredAt: dto.occurredAt ?? dto.createdAt ?? "",
  };
};

export const toActivityLogDetail = (item) => {
  const dto = stripInternalKeys(item);
  return {
    ...toActivityLogListItem(item),
    logData: dto.logData ?? {},
    orgRootId: dto.orgRootId ?? null,
    actorEmail: dto.actorEmail ?? "",
    actorSub: dto.actorSub ?? "",
    createdAt: dto.createdAt ?? "",
  };
};
