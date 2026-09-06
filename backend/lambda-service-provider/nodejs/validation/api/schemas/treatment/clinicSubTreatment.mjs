import { BigFloat, Boolean, String } from "../../shared/primitives.schema.mjs";
import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";

export const ClinicSubTreatmentSync = {
  type: "object",
  additionalProperties: false,
  required: ["clinicTreatmentId", "subTreatments"],
  properties: {
    clinicTreatmentId: { type: "string", minLength: 1 },
    subTreatments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "price", "duration", "available", "brandIds"],
        properties: {
          id: String,
          name: String,
          price: BigFloat,
          duration: String,
          available: Boolean,
          brandIds: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
          },
        },
        errorMessage: {
          additionalProperties: "Unknown field in sub treatment",
          required: {
            name: "Sub treatment name is required",
            price: "Sub treatment price is required",
            duration: "Sub treatment duration is required",
            available: "Availability status is required",
            brandIds: "At least one brand ID is required",
          },
          properties: {
            name: "Sub treatment name is required",
            price: "Sub treatment price must be at least 1",
            duration: "Sub treatment duration is required",
            brandIds: "At least one brand ID is required",
          },
        },
      },
    },
  },
  errorMessage: {
    type: "Invalid request body",
    additionalProperties: "Unknown field supplied in request body",
    required: {
      clinicTreatmentId: "Clinic treatment ID is required",
      subTreatments: "Sub treatments are required",
    },
  },
};

export const SubTreatmentList = openSearchListBody();
