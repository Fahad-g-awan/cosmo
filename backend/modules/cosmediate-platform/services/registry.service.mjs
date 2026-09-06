import {
  PERMISSIONS_REGISTRY,
  RESOURCE_LABELS,
  IMPLICIT_GRANTS,
  ROLE_IMPLICIT_GRANTS,
} from "/opt/nodejs/constants/auth/permissions/index.mjs";
import {
  AUTH_STATUS,
  USER_STATUS,
} from "/opt/nodejs/constants/auth/status.constants.mjs";
import {
  AUTH_TYPE,
  USER_ROLES,
} from "/opt/nodejs/constants/auth/roles.constants.mjs";
import {
  ERROR_CODE,
  PROVIDER_LINKED_RETRY_CODE,
} from "/opt/nodejs/constants/errors/index.mjs";
import {
  CLINIC_TYPES,
  CLINIC_STATUS,
} from "/opt/nodejs/constants/domain/clinic.constants.mjs";
import { ACTIVITY_MONITORING_ACTION } from "/opt/nodejs/constants/db/activity-monitoring.actions.mjs";
import { DDB_INDEX_NAMES } from "/opt/nodejs/constants/db/dynamodb/index-names.constants.mjs";
import { AUTH_BOUNDED_RETRY_FLOWS } from "/opt/nodejs/config/auth/bounded-retry-flows.mjs";
import { SPECIALIST_STATUS } from "/opt/nodejs/constants/domain/specialist.constants.mjs";
import { LOG_SCOPE_ENTITY_TYPES } from "/opt/nodejs/constants/db/log-scope-entities.mjs";
import { TREATMENT_STATUS } from "/opt/nodejs/constants/domain/treatment.constants.mjs";
import { DDB_GSI_KEYS } from "/opt/nodejs/constants/db/dynamodb/gsi-keys.constants.mjs";
import { WORKING_TYPES } from "/opt/nodejs/constants/domain/shared.constants.mjs";
import { AUDIT_LOG_ACTION } from "/opt/nodejs/constants/db/audit-log.actions.mjs";
import { SUPER_ACCESS_GRANT } from "/opt/nodejs/config/auth/super-access.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { DB_EVENT } from "/opt/nodejs/constants/db/db-events.mjs";

export const buildPermissionsRegistryPayload = () => ({
  registry: PERMISSIONS_REGISTRY,
  labels: RESOURCE_LABELS,
  implicitGrants: IMPLICIT_GRANTS,
  roleImplicitGrants: ROLE_IMPLICIT_GRANTS,
  superAccessGrant: SUPER_ACCESS_GRANT,
});

export const getRegistry = async () => ({
  statusCode: 200,
  data: {
    constants: {
      auth: {
        ERROR_CODE,
        AUTH_STATUS,
        AUTH_TYPE,
        AUTH_BOUNDED_RETRY_FLOWS,
        PROVIDER_LINKED_RETRY_CODE,
        USER_ROLES,
        USER_STATUS,
        superAccessGrant: SUPER_ACCESS_GRANT,
      },
      db: {
        DDB_INDEX_NAMES,
        DDB_GSI_KEYS,
        AUDIT_LOG_ACTION,
        ACTIVITY_MONITORING_ACTION,
        LOG_SCOPE_ENTITY_TYPES,
        DB_EVENT,
        ENTITY_TYPE,
        CLINIC_TYPES,
        WORKING_TYPES,
        CLINIC_STATUS,
        SPECIALIST_STATUS,
        TREATMENT_STATUS,
      },
      permissions: buildPermissionsRegistryPayload(),
    },
    success: true,
  },
});
