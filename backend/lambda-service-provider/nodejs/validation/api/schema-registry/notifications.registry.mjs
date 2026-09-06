import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import {
  AnnouncementCreate,
  AnnouncementUpdate,
  AnnouncementDelete,
  AnnouncementList,
  NotificationDismiss,
} from "../schemas/notifications/announcement.mjs";

export const NOTIFICATIONS_SCHEMAS = {
  [CRUD_ACTIONS.ANNOUNCEMENT.CREATE]: AnnouncementCreate,
  [CRUD_ACTIONS.ANNOUNCEMENT.UPDATE]: AnnouncementUpdate,
  [CRUD_ACTIONS.ANNOUNCEMENT.DELETE]: AnnouncementDelete,
  [CRUD_ACTIONS.ANNOUNCEMENT.LIST]: AnnouncementList,
  [CRUD_ACTIONS.ANNOUNCEMENT.DISMISS]: NotificationDismiss,
};
