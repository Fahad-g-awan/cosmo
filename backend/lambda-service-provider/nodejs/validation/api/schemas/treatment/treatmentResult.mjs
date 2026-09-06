import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import { URI, String } from "../../shared/primitives.schema.mjs";

export const TreatmentResultList = openSearchListBody();

export const TreatmentResultCreate = {
  type: "object",
  additionalProperties: false,
  required: ["beforeImage", "afterImage", "description"],
  properties: {
    ownerType: {
      type: "string",
      enum: ["ADMIN", "CLINIC"],
    },
    clinicTreatmentId: String,
    treatmentId: String,
    beforeImage: URI,
    afterImage: URI,
    description: String,
  },
  oneOf: [
    {
      required: ["clinicTreatmentId"],
      properties: {
        clinicTreatmentId: String,
      },
    },
    {
      required: ["treatmentId"],
      properties: {
        treatmentId: String,
      },
    },
  ],
  errorMessage: {
    required: {
      beforeImage: "Before image is required",
      afterImage: "After image is required",
      description: "Description is required",
      treatmentId: "Treatment is required",
      clinicTreatmentId: "Clinic treatment is required",
    },
    oneOf: "Either clinic treatment ID or treatment ID is required",
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      beforeImage: "Before image is required",
      afterImage: "After image is required",
      description: "Description is required",
      treatmentId: "Treatment is required",
    },
  },
};

export const TreatmentResultUpdate = {
  type: "object",
  additionalProperties: false,
  required: ["id", "beforeImage", "afterImage", "description"],
  properties: {
    id: String,
    clinicTreatmentId: String,
    treatmentId: String,
    beforeImage: URI,
    afterImage: URI,
    description: String,
  },
  oneOf: [
    {
      required: ["clinicTreatmentId"],
      properties: {
        clinicTreatmentId: String,
      },
    },
    {
      required: ["treatmentId"],
      properties: {
        treatmentId: String,
      },
    },
  ],
  errorMessage: {
    required: {
      id: "Treatment result ID is required",
      beforeImage: "Before image is required",
      afterImage: "After image is required",
      description: "Description is required",
      treatmentId: "Treatment is required",
      clinicTreatmentId: "Clinic treatment is required",
    },
    oneOf: "Either clinic treatment ID or treatment ID is required",
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Treatment result ID is required",
      beforeImage: "Before image is required",
      afterImage: "After image is required",
      description: "Description is required",
      treatmentId: "Treatment is required",
    },
  },
};

export const TreatmentResultDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "Treatment result ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Treatment result ID is required",
    },
  },
};
