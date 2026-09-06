import {
  ANNOUNCEMENT_SEVERITY,
  ANNOUNCEMENT_STATUS,
  ANNOUNCEMENT_SURFACES,
} from "../../../../constants/domain/announcement.constants.mjs";
import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import {
  String,
  ClearableString,
  ClearableInteger,
} from "../../shared/primitives.schema.mjs";

const roleEnum = {
  type: "string",
  enum: ["ADMIN", "MANAGER", "SPECIALIST", "PATIENT"],
};

const surfaceEnum = {
  type: "string",
  enum: Object.values(ANNOUNCEMENT_SURFACES),
};

const severity = {
  type: "string",
  enum: Object.values(ANNOUNCEMENT_SEVERITY),
  errorMessage: {
    enum: "Severity must be one of: INFO, SUCCESS, WARNING, ERROR",
  },
};

const status = {
  type: "string",
  enum: Object.values(ANNOUNCEMENT_STATUS),
  errorMessage: {
    enum: "Status must be one of: DRAFT, ACTIVE, EXPIRED",
  },
};

const targetRoles = {
  type: "array",
  minItems: 1,
  uniqueItems: true,
  items: roleEnum,
  errorMessage: {
    minItems: "Select at least one target role",
  },
};

const targetSurfaces = {
  type: "array",
  minItems: 1,
  uniqueItems: true,
  items: surfaceEnum,
  errorMessage: {
    minItems: "Select at least one target surface",
  },
};

const actionPairRules = [
  {
    if: {
      required: ["actionLabel"],
      properties: {
        actionLabel: { type: "string", minLength: 1 },
      },
    },
    then: {
      required: ["actionUrl"],
      properties: {
        actionUrl: {
          type: "string",
          minLength: 1,
          pattern: "\\S",
          errorMessage: {
            minLength: "Action URL is required when action label is set",
            pattern: "Action URL is required when action label is set",
          },
        },
      },
    },
  },
  {
    if: {
      required: ["actionUrl"],
      properties: {
        actionUrl: { type: "string", minLength: 1 },
      },
    },
    then: {
      required: ["actionLabel"],
      properties: {
        actionLabel: {
          type: "string",
          minLength: 1,
          pattern: "\\S",
          errorMessage: {
            minLength: "Action label is required when action URL is set",
            pattern: "Action label is required when action URL is set",
          },
        },
      },
    },
  },
];

const announcementProperties = {
  title: String,
  message: String,
  severity,
  status,
  priority: ClearableInteger,
  startsAt: ClearableString,
  endsAt: ClearableString,
  dismissible: { type: "boolean" },
  targetRoles,
  targetSurfaces,
  actionLabel: ClearableString,
  actionUrl: ClearableString,
};

export const AnnouncementCreate = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "message",
    "severity",
    "status",
    "dismissible",
    "targetRoles",
    "targetSurfaces",
  ],
  properties: announcementProperties,
  allOf: actionPairRules,
  errorMessage: {
    required: {
      title: "Title is required",
      message: "Message is required",
      severity: "Severity is required",
      status: "Status is required",
      dismissible: "Dismissible is required",
      targetRoles: "Select at least one target role",
      targetSurfaces: "Select at least one target surface",
    },
    additionalProperties: "Unknown field supplied in request body",
  },
};

export const AnnouncementUpdate = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "title",
    "message",
    "severity",
    "status",
    "dismissible",
    "targetRoles",
    "targetSurfaces",
  ],
  properties: {
    id: String,
    ...announcementProperties,
  },
  allOf: actionPairRules,
  errorMessage: {
    required: {
      id: "Announcement ID is required",
      title: "Title is required",
      message: "Message is required",
      severity: "Severity is required",
      status: "Status is required",
      dismissible: "Dismissible is required",
      targetRoles: "Select at least one target role",
      targetSurfaces: "Select at least one target surface",
    },
    additionalProperties: "Unknown field supplied in request body",
  },
};

export const AnnouncementDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "Announcement ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Announcement ID is required",
    },
  },
};

export const AnnouncementList = openSearchListBody();

export const NotificationDismiss = {
  type: "object",
  additionalProperties: false,
  required: ["announcementId"],
  properties: {
    announcementId: String,
  },
  errorMessage: {
    required: {
      announcementId: "Announcement ID is required",
    },
  },
};
