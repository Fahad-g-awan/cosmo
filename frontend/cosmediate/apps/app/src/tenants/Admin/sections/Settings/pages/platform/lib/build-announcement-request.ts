import type {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@cosmediate/api";

import { ALLOWED_ANNOUNCEMENT_FIELDS } from "../constants/announcements.constants";
import type { AnnouncementFormValues } from "../types/announcement.types";

const OPTIONAL_CLEARABLE = new Set([
  "priority",
  "startsAt",
  "endsAt",
  "actionLabel",
  "actionUrl",
]);

/**
 * Build announcement JSON body.
 * Required fields must be present; optional empties are sent as null so update can clear.
 */
const pickAnnouncementFields = (
  data: Partial<AnnouncementFormValues>,
  { clearEmptyOptionals }: { clearEmptyOptionals: boolean },
) => {
  const requestData: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (!ALLOWED_ANNOUNCEMENT_FIELDS.has(key)) return;

    if (key === "dismissible") {
      requestData.dismissible = Boolean(value);
      return;
    }

    if (key === "targetRoles" || key === "targetSurfaces") {
      if (Array.isArray(value)) requestData[key] = value;
      return;
    }

    if (OPTIONAL_CLEARABLE.has(key)) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "number" && Number.isNaN(value))
      ) {
        if (clearEmptyOptionals) requestData[key] = null;
        return;
      }
      requestData[key] = value;
      return;
    }

    if (value === undefined || value === null || value === "") return;
    requestData[key] = value;
  });

  return requestData;
};

export const buildAnnouncementCreateBody = (
  data: Partial<AnnouncementFormValues>,
): CreateAnnouncementRequest =>
  pickAnnouncementFields(data, {
    clearEmptyOptionals: false,
  }) as unknown as CreateAnnouncementRequest;

export const buildAnnouncementUpdateBody = (
  data: Partial<AnnouncementFormValues>,
  id: string,
): UpdateAnnouncementRequest =>
  ({
    id,
    ...pickAnnouncementFields(data, { clearEmptyOptionals: true }),
  }) as UpdateAnnouncementRequest;
