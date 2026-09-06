import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
  getAnnouncementByIdHandler,
  listAnnouncements,
  updateAnnouncement,
} from "../services/announcement.service.mjs";

export const createAnnouncementHandler = async () => {
  try {
    return await createAnnouncement(getRequestContext());
  } catch (error) {
    console.error("[announcements] create", error);
    rethrowOrInternal(error);
  }
};

export const getAnnouncement = async () => {
  try {
    return await getAnnouncementByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[announcements] get", error);
    rethrowOrInternal(error);
  }
};

export const getAnnouncements = async () => {
  try {
    return await listAnnouncements(getRequestContext());
  } catch (error) {
    console.error("[announcements] list", error);
    rethrowOrInternal(error);
  }
};

export const updateAnnouncementHandler = async () => {
  try {
    return await updateAnnouncement(getRequestContext());
  } catch (error) {
    console.error("[announcements] update", error);
    rethrowOrInternal(error);
  }
};

export const deleteAnnouncementHandler = async () => {
  try {
    return await deleteAnnouncement(getRequestContext());
  } catch (error) {
    console.error("[announcements] delete", error);
    rethrowOrInternal(error);
  }
};

export const getActiveAnnouncementsHandler = async () => {
  try {
    return await getActiveAnnouncements(getRequestContext());
  } catch (error) {
    console.error("[announcements] active", error);
    rethrowOrInternal(error);
  }
};
