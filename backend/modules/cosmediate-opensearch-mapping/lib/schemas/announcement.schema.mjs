import { kw, kwNorm, textAC, Boolean, Integer } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

/** OpenSearch mapping for the announcements index. */
export const buildAnnouncementMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      title: textAC(),
      message: textAC(),
      severity: kw(),
      status: kw(),
      priority: Integer(),
      startsAt: { type: "date" },
      endsAt: { type: "date" },
      dismissible: Boolean(),
      targetRoles: kwNorm(),
      targetSurfaces: kwNorm(),
      actionLabel: textAC(),
      actionUrl: kw(),
      authorId: kw(),
      authorName: textAC(),
      authorEmail: kwNorm(),
      searchClicks: Integer(),
    },
  },
});
