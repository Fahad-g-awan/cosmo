import {
  PlatformActivityLogsList,
  PlatformAuditLogsList,
} from "../schemas/platform.mjs";
import { SystemSettingUpdate } from "../schemas/platform/system-settings.mjs";
import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";

export const PLATFORM_SCHEMAS = {
  [CRUD_ACTIONS.PLATFORM.AUDIT_LOGS_LIST]: PlatformAuditLogsList,
  [CRUD_ACTIONS.PLATFORM.ACTIVITY_LOGS_LIST]: PlatformActivityLogsList,
  [CRUD_ACTIONS.PLATFORM.SYSTEM_SETTINGS_UPDATE]: SystemSettingUpdate,
};
