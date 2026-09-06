import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

import { runIndexPipeline } from "../../lib/pipeline/run-index-pipeline.mjs";

export const upsertTreatmentResultDocument = async () => {
  try {
    const { indexAlias, entityId, entityType, prisma } = getRequestContext();

    const treatmentResult = await prisma.treatmentResult.findUnique({
      where: { id: entityId },
      include: {
        clinicTreatment: {
          include: {
            treatment: { select: { id: true, name: true } },
            clinic: { select: { id: true } },
          },
        },
        treatment: { select: { id: true, name: true } },
      },
    });

    if (!treatmentResult) {
      throw new Error(`Treatment result not found: ${entityId}`);
    }

    const ownerType =
      treatmentResult.ownerType ??
      (treatmentResult.clinicTreatmentId ? "CLINIC" : "ADMIN");

    const ct = treatmentResult.clinicTreatment;
    const clinicTreatmentStatus = ct?.status ?? null;

    const indexPayload = {
      id: treatmentResult.id,
      entityType: treatmentResult.entityType,
      ownerType,
      beforeImage: treatmentResult.beforeImage,
      afterImage: treatmentResult.afterImage,
      description: treatmentResult.description,
      createdAt: treatmentResult.createdAt,
      updatedAt: treatmentResult.updatedAt,
      deletedAt: treatmentResult.deletedAt,
      deleted: treatmentResult.deleted,
      ...(treatmentResult.clinicTreatmentId && {
        clinicTreatmentId: treatmentResult.clinicTreatmentId,
        clinicTreatmentStatus,
        clinicId:
          treatmentResult.clinicId ?? ct?.clinicId ?? ct?.clinic?.id ?? null,
        treatmentId:
          treatmentResult.treatmentId ??
          ct?.treatmentId ??
          ct?.treatment?.id ??
          null,
        categoryId: treatmentResult.categoryId ?? ct?.categoryId ?? null,
        categoryName: treatmentResult.categoryName ?? ct?.categoryName ?? null,
        treatmentName:
          ct?.treatmentName ?? ct?.treatment?.name ?? treatmentResult.treatment?.name,
      }),
      ...(ownerType === "ADMIN" && {
        treatmentId:
          treatmentResult.treatmentId ?? treatmentResult.treatment?.id ?? null,
        treatmentName: treatmentResult.treatment?.name ?? null,
      }),
    };

    return runIndexPipeline(indexPayload, { indexAlias, entityType });
  } catch (error) {
    console.error("[upsertTreatmentResultDocument]", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: error?.message ?? "Treatment result indexing failed",
      details: ["Treatment result indexing failed"],
    });
  }
};
