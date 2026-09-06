import {
  LEAD_TYPE,
} from "../../../constants/domain/lead.constants.mjs";
import { String, Integer } from "../shared/primitives.schema.mjs";
import { email, phone } from "../shared/fragments.schema.mjs";
import { enums } from "../shared/enums.schema.mjs";

export const LeadCreate = {
  type: "object",
  additionalProperties: false,

  required: ["type", "email", "recaptchaToken"],

  properties: {
    email,
    firstName: String,
    lastName: String,
    phone,
    age: Integer,

    country: String,
    state: String,
    city: String,
    completeAddress: String,
    postalCode: String,

    subject: String,
    message: String,
    registrationNumber: String,
    companyName: String,

    type: { type: "string", enum: enums.leadType },
    source: { type: "string", enum: enums.leadSource },
    status: { type: "string", enum: enums.leadStatus },

    recaptchaToken: { type: "string", minLength: 1 },
  },

  allOf: [
    // If type is CLINIC
    {
      if: {
        properties: {
          type: { const: LEAD_TYPE.CLINIC },
        },
      },
      then: {
        required: ["companyName", "subject", "message"],
        properties: {
          companyName: String,
          subject: String,
          message: String,
        },
        errorMessage: {
          required: {
            companyName: "companyName is required when type is CLINIC",
            subject: "subject is required when type is CLINIC",
            message: "message is required when type is CLINIC",
          },
        },
      },
    },

    // If type is DOCTOR
    {
      if: {
        properties: {
          type: { const: LEAD_TYPE.DOCTOR },
        },
      },
      then: {
        required: ["registrationNumber", "subject", "message"],
        properties: {
          registrationNumber: String,
          subject: String,
          message: String,
        },
        errorMessage: {
          required: {
            registrationNumber:
              "registrationNumber is required when type is DOCTOR",
            subject: "subject is required when type is DOCTOR",
            message: "message is required when type is DOCTOR",
          },
        },
      },
    },

    // If type is CONTACT
    {
      if: {
        properties: {
          type: { const: LEAD_TYPE.CONTACT },
        },
      },
      then: {
        required: ["subject", "message"],
        properties: {
          subject: String,
          message: String,
        },
        errorMessage: {
          required: {
            subject: "subject is required when type is CONTACT",
            message: "message is required when type is CONTACT",
          },
        },
      },
    },
  ],

  errorMessage: {
    required: {
      email: "Email is required",
      type: "Type is required, one of [DOCTOR, CLINIC, SUBSCRIPTION, CONTACT]",
      message: "Message is required for all leads",
      recaptchaToken: "reCAPTCHA token is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      email: "Email must be a valid address",
      type: "Type must be one of [DOCTOR, CLINIC, SUBSCRIPTION, CONTACT]",
      message: "Message is required for all leads",
      recaptchaToken: "reCAPTCHA token must be a non-empty string",
    },
  },
};

export const LeadUpdate = {
  type: "object",
  additionalProperties: false,

  required: ["id", "type", "email"],

  properties: {
    id: String,
    email,
    firstName: String,
    lastName: String,
    phone,
    age: Integer,

    country: String,
    state: String,
    city: String,
    completeAddress: String,
    postalCode: String,

    subject: String,
    message: String,
    registrationNumber: String,
    companyName: String,

    type: { type: "string", enum: enums.leadType },
    source: { type: "string", enum: enums.leadSource },
    status: { type: "string", enum: enums.leadStatus },
  },

  allOf: [
    // If type is CLINIC
    {
      if: {
        properties: {
          type: { const: LEAD_TYPE.CLINIC },
        },
      },
      then: {
        required: ["companyName", "subject", "message"],
        properties: {
          companyName: String,
          subject: String,
          message: String,
        },
        errorMessage: {
          required: {
            companyName: "companyName is required when type is CLINIC",
            subject: "subject is required when type is CLINIC",
            message: "message is required when type is CLINIC",
          },
        },
      },
    },

    // If type is DOCTOR
    {
      if: {
        properties: {
          type: { const: LEAD_TYPE.DOCTOR },
        },
      },
      then: {
        required: ["registrationNumber", "subject", "message"],
        properties: {
          registrationNumber: String,
          subject: String,
          message: String,
        },
        errorMessage: {
          required: {
            registrationNumber:
              "registrationNumber is required when type is DOCTOR",
            subject: "subject is required when type is DOCTOR",
            message: "message is required when type is DOCTOR",
          },
        },
      },
    },

    // If type is CONTACT
    {
      if: {
        properties: {
          type: { const: LEAD_TYPE.CONTACT },
        },
      },
      then: {
        required: ["subject", "message"],
        properties: {
          subject: String,
          message: String,
        },
        errorMessage: {
          required: {
            subject: "subject is required when type is CONTACT",
            message: "message is required when type is CONTACT",
          },
        },
      },
    },
  ],

  errorMessage: {
    additionalProperties: "Unknown field supplied in request body",
    required: {
      id: "ID is required",
      email: "Email is required",
      type: "Type is required, one of [DOCTOR, CLINIC, SUBSCRIPTION, CONTACT]",
      message: "Message is required for all leads",
    },
    properties: {
      id: "ID is required",
      email: "Email must be a valid address",
      type: "Type must be one of [DOCTOR, CLINIC, SUBSCRIPTION, CONTACT]",
      message: "Message is required for all leads",
    },
  },
};

export const LeadStatusUpdate = {
  type: "object",
  additionalProperties: false,

  required: ["id", "status"],

  properties: {
    id: String,
    status: { type: "string", enum: enums.leadStatus },
  },

  errorMessage: {
    additionalProperties: "Unknown field supplied in request body",
    required: {
      id: "ID is required",
      status: "Status is required",
    },
    properties: {
      id: "ID is required",
      status: "Status must be one of [DOCTOR, CLINIC, SUBSCRIPTION, CONTACT]",
    },
  },
};

export const LeadDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    additionalProperties: "Unknown field supplied in request body",
    required: {
      id: "Lead ID is required",
    },
    properties: {
      id: "Lead ID is required",
    },
  },
};
