import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import { String } from "../../shared/primitives.schema.mjs";

export const ClinicAssignmentSync = {
  type: "object",
  additionalProperties: false,
  required: ["clinicTreatmentId", "assignments"],
  properties: {
    clinicTreatmentId: { type: "string", minLength: 1 },
    assignments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["specialistId", "specialistExperience"],
        properties: {
          specialistId: String,
          specialistExperience: String,
        },
        errorMessage: {
          additionalProperties: "Unknown field in assignment",
          required: {
            specialistId: "Specialist ID is required",
            specialistExperience: "Specialist experience is required",
          },
          properties: {
            specialistId: "Specialist ID is required",
            specialistExperience: "Specialist experience is required",
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
      assignments: "Assignments are required",
    },
  },
};

export const ClinicSpecialistTreatmentList = openSearchListBody();
