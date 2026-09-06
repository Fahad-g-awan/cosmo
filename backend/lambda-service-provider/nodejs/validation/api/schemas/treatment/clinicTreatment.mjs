import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";

export const ClinicTreatmentSync = {
  type: "object",
  additionalProperties: false,
  required: ["clinicId", "treatmentIds"],
  properties: {
    clinicId: { type: "string", minLength: 1 },
    treatmentIds: {
      type: "array",
      items: { type: "string", minLength: 1 },
    },
  },
  errorMessage: {
    required: {
      clinicId: "Clinic ID is required",
      treatmentIds: "Treatment IDs are required",
    },
  },
};

const listBody = openSearchListBody();

export const ClinicTreatmentList = {
  ...listBody,
  required: ["clinicId"],
  properties: {
    clinicId: { type: "string", minLength: 1 },
    ...listBody.properties,
  },
  errorMessage: {
    required: {
      clinicId: "Clinic ID is required",
    },
  },
};
