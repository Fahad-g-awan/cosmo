import {
  certificates,
  email,
  faqs,
  htmlBlob,
  perms,
  phone,
  clearablePhone,
  tags,
  workingHours,
} from "../shared/fragments.schema.mjs";
import {
  Boolean,
  String,
  Integer,
  URI,
  ClearableString,
  ClearableURI,
  ClearableInteger,
} from "../shared/primitives.schema.mjs";
import { openSearchListBody } from "../shared/opensearch-list.schema.mjs";
import { WORKING_TYPES } from "../../../constants/domain/shared.constants.mjs";
import { enums, Gender, ClearableGender } from "../shared/enums.schema.mjs";

/** Specialist overview — same length rules as clinic overview. */
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

export const SpecialistGetByTreatment = {
  type: "object",
  additionalProperties: true,
  required: ["treatmentId"],
  properties: {
    treatmentId: String,
  },
  errorMessage: {
    required: {
      treatmentId: "Treatment ID is required",
    },
    properties: {
      treatmentId: "Treatment ID must be a valid address",
    },
  },
};

export const SpecialistList = openSearchListBody();

export const SpecialistCreate = {
  type: "object",
  additionalProperties: false,
  required: [
    "email",
    "firstName",
    "lastName",
    "workingType",
    "available",
    "status",
  ],
  properties: {
    available: Boolean,
    activeClinicId: String,
    parentClinicId: String,
    clinicIds: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: String,
    },
    workingType: { type: "string", enum: enums.workingTypes },

    email,
    specialistImage: URI,
    firstName: String,
    lastName: String,
    phone,
    age: Integer,
    gender: Gender,
    totalExperience: Integer,
    htmlAbout: htmlBlob,
    overview: Overview,

    instagramId: String,
    website: String,

    country: String,
    state: String,
    city: String,
    completeAddress: String,
    postalCode: String,

    status: { type: "string", enum: enums.userStatus },

    faqs,
    tags,
    workingHours,
    certificates,

    perms,
  },
  allOf: [
    {
      if: { properties: { workingType: { const: WORKING_TYPES.FULL_TIME } } },
      then: {
        required: ["parentClinicId"],
        properties: { parentClinicId: String },
      },
    },
    {
      if: { properties: { workingType: { const: WORKING_TYPES.FREELANCE } } },
      then: {
        required: ["clinicIds"],
        properties: {
          clinicIds: { type: "array", minItems: 1, items: String },
        },
      },
    },
  ],
  errorMessage: {
    required: {
      available: "Availability is required",
      status: "Status is required",
      email: "Email is required",
      firstName: "First name is required",
      lastName: "Last name is required",
      workingType: "Working type is required",
      parentClinicId: "Parent clinic ID is required",
      clinicIds: "Clinic IDs are required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      available: "Availability must be a boolean value",
      status: "Status must be one of the allowed values",
      email: "Email format is invalid",
      firstName: "First name is invalid",
      lastName: "Last name is invalid",
      phone: "Phone number must be in international format (e.g., +1234567890)",
      workingType: "Working type is invalid or missing",
      parentClinicId: "Parent clinic ID is required",
      clinicIds: "Clinic IDs are required",
      faqs: "FAQs must be a valid list",
    },
  },
};

export const SpecialistUpdate = {
  type: "object",
  additionalProperties: false,
  required: [
    "email",
    "id",
    "firstName",
    "lastName",
    "workingType",
    "available",
    "status",
  ],
  properties: {
    id: String,
    activeClinicId: String,
    parentClinicId: String,
    clinicIds: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: String,
    },
    workingType: { type: "string", enum: enums.workingTypes },

    email,
    specialistImage: ClearableURI,
    firstName: String,
    lastName: String,
    phone: clearablePhone,
    age: ClearableInteger,
    gender: ClearableGender,
    totalExperience: ClearableInteger,
    htmlAbout: htmlBlob,
    overview: Overview,

    instagramId: ClearableString,
    website: ClearableString,

    country: ClearableString,
    state: ClearableString,
    city: ClearableString,
    completeAddress: ClearableString,
    postalCode: ClearableString,

    status: { type: "string", enum: enums.userStatus },
    available: Boolean,

    faqs,
    tags,
    workingHours,
    certificates,
    perms,
  },
  allOf: [
    {
      if: { properties: { workingType: { const: WORKING_TYPES.FULL_TIME } } },
      then: {
        required: ["parentClinicId"],
        properties: { parentClinicId: String },
      },
    },
    {
      if: { properties: { workingType: { const: WORKING_TYPES.FREELANCE } } },
      then: {
        required: ["clinicIds"],
        properties: {
          clinicIds: { type: "array", minItems: 1, items: String },
        },
      },
    },
  ],
  errorMessage: {
    required: {
      id: "Specialist ID is required",
      status: "Status is required",
      available: "Availability is required",
      email: "Email is required",
      firstName: "First name is required",
      lastName: "Last name is required",
      workingType: "Working type is required",
      parentClinicId: "Parent clinic ID is required",
      clinicIds: "Clinic IDs are required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Specialist ID is required",
      available: "Availability must be a boolean value",
      status: "Status must be one of the allowed values",
      email: "Email format is invalid",
      firstName: "First name is invalid",
      lastName: "Last name is invalid",
      phone: "Phone number must be in international format (e.g., +1234567890)",
      workingType: "Working type is invalid or missing",
      parentClinicId: "Parent clinic ID is required",
      clinicIds: "Clinic IDs are required",
      faqs: "FAQs must be a valid list",
    },
  },
};

export const SpecialistDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "Specialist ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Specialist ID is required",
    },
  },
};
