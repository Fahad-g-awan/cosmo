import { joinText } from "../documents.mjs";

/** Map a Postgres announcement row to an OpenSearch search document. */
export const mapAnnouncementSearchDocument = (baseDoc, data) => {
  const targetRoles = Array.isArray(data?.targetRoles) ? data.targetRoles : [];
  const targetSurfaces = Array.isArray(data?.targetSurfaces)
    ? data.targetSurfaces
    : [];

  const doc = {
    ...baseDoc,
    title: data?.title,
    message: data?.message,
    severity: data?.severity,
    status: data?.status,
    priority: data?.priority ?? 0,
    startsAt: data?.startsAt ?? null,
    endsAt: data?.endsAt ?? null,
    dismissible: data?.dismissible ?? true,
    targetRoles,
    targetSurfaces,
    actionLabel: data?.actionLabel ?? null,
    actionUrl: data?.actionUrl ?? null,
    authorId: data?.authorId,
    authorName: data?.authorName,
    authorEmail: data?.authorEmail,
    searchClicks: data?.searchClicks ?? 0,
  };

  doc.searchableText = joinText([
    doc.title,
    doc.message,
    doc.severity,
    doc.status,
    doc.authorName,
    doc.authorEmail,
    doc.actionLabel,
    ...targetRoles,
    ...targetSurfaces,
  ]);

  return doc;
};
