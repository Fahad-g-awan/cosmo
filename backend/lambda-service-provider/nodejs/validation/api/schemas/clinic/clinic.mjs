import {
  certificates,
  clearablePhone,
  email,
  faqs,
  htmlBlob,
  perms,
  phone,
  tags,
  workingHours,
} from "../../shared/fragments.schema.mjs";
import {
  Boolean,
  String,
  Integer,
  URI,
  ClearableString,
  ClearableURI,
} from "../../shared/primitives.schema.mjs";
import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import { CLINIC_TYPES } from "../../../../constants/domain/clinic.constants.mjs";
import { enums, Gender } from "../../shared/enums.schema.mjs";

const clinicByTreatmentListBody = openSearchListBody();

/** Clinic overview — shared length for create/update and future entity overviews. */
const Overview = {
  type: "string",
  minLength: 10,
  maxLength: 300,
  pattern: "\\S",
  errorMessage: {
    minLength: "Overview must be at least 10 characters",
    maxLength: "Overview must be at most 300 characters",
    pattern: "Overview cannot be empty or whitespace only",
  },
};

const ClinicName = {
  type: "string",
  minLength: 2,
  maxLength: 100,
  pattern: "\\S",
  errorMessage: {
    minLength: "Name must be at least 2 characters",
    maxLength: "Name must be at most 100 characters",
  },
};

export const ClinicGetByTreatment = {
  type: "object",
  additionalProperties: false,
  required: ["filters"],
  properties: {
    ...clinicByTreatmentListBody.properties,
    treatmentId: String,
    filters: {
      type: "object",
      additionalProperties: true,
      required: ["treatmentId"],
      properties: {
        treatmentId: String,
      },
    },
  },
  errorMessage: {
    required: {
      filters: "Filters are required",
    },
    properties: {
      treatmentId: "Treatment ID must be a valid string",
    },
  },
};

export const ClinicList = openSearchListBody();

export const ClinicCreate = {
  type: "object",
  additionalProperties: false,
  required: [
    "clinicType",
    "email",
    "name",
    "status",
    "available",
    "overview",
    "categories",
  ],
  properties: {
    managerIds: { type: "array", items: String, minItems: 1 },

    managerEmail: email,
    managerFirstName: String,
    managerLastName: String,
    managerPhone: phone,
    managerGender: Gender,
    managerAge: Integer,
    managerStatus: { type: "string", enum: enums.userStatus },
    managerCountry: String,
    managerState: String,
    managerCity: String,
    managerPostalCode: String,
    managerCompleteAddress: String,
    managerPerms: perms,

    parentClinicId: String,

    clinicType: { type: "string", enum: enums.clinicTypes },
    clinicLogo: URI,
    email,
    name: ClinicName,
    phone,
    clinicImages: { type: "array", items: URI },
    categories: {
      type: "array",
      items: String,
      minItems: 1,
    },
    clinicAge: String,
    htmlAbout: htmlBlob,
    overview: Overview,

    instagramId: String,
    website: String,

    country: String,
    state: String,
    city: String,
    completeAddress: String,
    postalCode: String,
    status: { type: "string", enum: enums.clinicStatus },
    available: Boolean,

    faqs,
    tags,
    workingHours,
    certificates,
  },
  allOf: [
    {
      if: { properties: { clinicType: { const: CLINIC_TYPES.NODE } } },
      then: {
        properties: {
          parentClinicId: String,
        },
        required: ["parentClinicId"],
      },
    },
    {
      if: { properties: { clinicType: { const: CLINIC_TYPES.PARENT } } },
      then: {
        properties: {
          managerEmail: email,
          managerFirstName: String,
          managerLastName: String,
          managerStatus: { type: "string", enum: enums.userStatus },
        },
        required: [
          "managerEmail",
          "managerFirstName",
          "managerLastName",
          "managerStatus",
        ],
      },
    },
    {
      anyOf: [
        {
          properties: {
            managerIds: {
              type: "array",
              minItems: 1,
              items: String,
            },
          },
          required: ["managerIds"],
        },
        {
          properties: {
            managerEmail: email,
            managerFirstName: String,
            managerLastName: String,
            managerStatus: { type: "string", enum: enums.userStatus },
          },
          required: [
            "managerEmail",
            "managerFirstName",
            "managerLastName",
            "managerStatus",
          ],
        },
      ],
    },
  ],
  errorMessage: {
    required: {
      clinicType: "Clinic type is required",
      parentClinicId: "Parent clinic ID is required",
      email: "Email is required",
      name: "Name is required",
      overview: "Overview is required",
      categories: "At least one category is required",
      status: "Status is required",
      available: "Availability is required",
      managerIds: "Manager is required",
      managerEmail: "Manager email is required when no manager ID is provided",
      managerFirstName:
        "Manager first name is required when no manager ID is provided",
      managerLastName:
        "Manager last name is required when no manager ID is provided",
      managerStatus:
        "Manager status is required when no manager ID is provided",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      clinicType: "Clinic type is invalid or missing",
      email: "Email format is invalid",
      name: "Name must be between 2–100 characters",
      phone: "Phone number must be in international format (e.g., +1234567890)",
      status: "Status must be one of the allowed values",
      available: "Availability must be a boolean value",
      managerIds:
        "Manager ID list must contain at least one entry or provide full manager details",
      managerEmail: "Manager email must be valid",
      managerFirstName: "Manager first name is invalid",
      managerLastName: "Manager last name is invalid",
      managerPhone:
        "Manager phone number must be in international format (e.g., +1234567890)",
    },
  },
};

export const ClinicUpdate = {
  type: "object",
  additionalProperties: false,
  required: ["id", "email", "name", "overview", "categories", "status", "available"],
  properties: {
    id: String,
    managerIds: { type: "array", minItems: 1, items: String },
    parentClinicId: String,

    clinicType: { type: "string", enum: enums.clinicTypes },
    email,
    name: ClinicName,
    phone: clearablePhone,
    clinicImages: { type: "array", items: URI },
    clinicLogo: ClearableURI,
    categories: {
      type: "array",
      items: String,
      minItems: 1,
    },
    clinicAge: ClearableString,
    country: ClearableString,
    state: ClearableString,
    city: ClearableString,
    completeAddress: ClearableString,
    postalCode: ClearableString,
    status: { type: "string", enum: enums.clinicStatus },
    available: Boolean,

    instagramId: ClearableString,
    website: ClearableString,
    htmlAbout: htmlBlob,
    overview: Overview,

    faqs,
    tags,
    workingHours,
    certificates,
  },
  allOf: [
    {
      if: { properties: { clinicType: { const: CLINIC_TYPES.NODE } } },
      then: {
        required: ["parentClinicId"],
        properties: {
          parentClinicId: String,
        },
      },
    },
  ],
  errorMessage: {
    required: {
      id: "Clinic ID is required",
      email: "Email is required",
      name: "Name is required",
      overview: "Overview is required",
      categories: "At least one category is required",
      status: "Clinic status is required",
      available: "Availability is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Clinic ID is required",
      email: "Email is required",
      status: "Clinic status is required",
      available: "Availability must be a boolean value",
      phone: "Phone number must be in international format (e.g., +1234567890)",
    },
  },
};

export const ClinicDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "ID is required",
    },
  },
};
