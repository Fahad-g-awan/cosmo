import { NOTIFICATIONS_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/notifications.routes.mjs";
import { AUTH_ROUTE_DEFS as A } from "/opt/nodejs/config/routes/auth.routes.mjs";

import {
  createAnnouncementHandler,
  deleteAnnouncementHandler,
  getActiveAnnouncementsHandler,
  getAnnouncement,
  getAnnouncements,
  updateAnnouncementHandler,
} from "../controllers/announcement.mjs";
import {
  dismissNotificationHandler,
  getMeNotificationsHandler,
} from "../controllers/notification.mjs";

export const ROUTES = new Map([
  [R.ACTIVE.key, getActiveAnnouncementsHandler],
  [R.MANAGEMENT_GET_ONE.key, getAnnouncement],
  [R.MANAGEMENT_LIST.key, getAnnouncements],
  [R.CREATE.key, createAnnouncementHandler],
  [R.UPDATE.key, updateAnnouncementHandler],
  [R.DELETE.key, deleteAnnouncementHandler],
  [A.ME_NOTIFICATIONS.key, getMeNotificationsHandler],
  [A.ME_DISMISS.key, dismissNotificationHandler],
]);
