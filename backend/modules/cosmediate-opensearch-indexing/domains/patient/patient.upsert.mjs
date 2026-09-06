import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { resolveOrgRootIdsForClinicIds } from "/opt/nodejs/services/prisma/org/clinic/org.mjs";
import { mergeIdentityForSearchDoc } from "../../lib/opensearch/documents.mjs";
import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";
import { IDENTITY_SEARCH_SELECT } from "../../lib/identity-select.mjs";

export const upsertPatientSearchDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const foundPatient = await prisma.patient.findUnique({
      where: { id: entityId },
      include: {
        identity: { select: IDENTITY_SEARCH_SELECT },
        patientClinics: { select: { clinicId: true } },
        patientSpecialists: { select: { specialistId: true } },
      },
    });

    if (!foundPatient) {
      throw new Error(`Patient not found: ${entityId}`);
    }

    const {
      identity,
      patientClinics = [],
      patientSpecialists = [],
      ...patientFields
    } = foundPatient;

    const patientClinicIds = patientClinics.map((r) => r.clinicId);
    const patientOrgRootIds = await resolveOrgRootIdsForClinicIds(
      prisma,
      patientClinicIds,
    );

    const indexPayload = mergeIdentityForSearchDoc(
      {
        ...patientFields,
        patientClinicIds,
        patientSpecialistIds: patientSpecialists.map((r) => r.specialistId),
        patientOrgRootIds,
      },
      identity,
    );

    return runIndexPipeline(indexPayload, { indexAlias, entityType });
  } catch (error) {
    console.error("[upsertPatientSearchDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Patient search indexing failed",
      details: ["Patient search indexing failed"],
    });
  }
};
