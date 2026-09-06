import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  dismissAnnouncement,
  getMeNotifications,
} from "../services/notification.service.mjs";

export const getMeNotificationsHandler = async () => {
  try {
    return await getMeNotifications(getRequestContext());
  } catch (error) {
    console.error("[notifications] me", error);
    rethrowOrInternal(error);
  }
};

export const dismissNotificationHandler = async () => {
  try {
    return await dismissAnnouncement(getRequestContext());
  } catch (error) {
    console.error("[notifications] dismiss", error);
    rethrowOrInternal(error);
  }
};
