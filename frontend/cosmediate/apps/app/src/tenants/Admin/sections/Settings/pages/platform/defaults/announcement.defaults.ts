import type { AnnouncementFormValues } from "../types/announcement.types";

export const defaultAnnouncementFormValues = {
  title: "",
  message: "",
  severity: undefined as unknown as AnnouncementFormValues["severity"],
  status: undefined as unknown as AnnouncementFormValues["status"],
  priority: undefined as unknown as number | undefined,
  startsAt: "",
  endsAt: "",
  dismissible: true,
  targetRoles: [],
  targetSurfaces: [],
  actionLabel: "",
  actionUrl: "",
} as AnnouncementFormValues;
