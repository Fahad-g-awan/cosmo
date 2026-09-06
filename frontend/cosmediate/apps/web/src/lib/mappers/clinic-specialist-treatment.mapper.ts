import type {
  ClinicSpecialistTreatment,
  Treatment,
} from "@cosmediate/type-utils";

export const dedupeClinicSpecialistTreatmentsByTreatmentId = (
  items: ClinicSpecialistTreatment[],
): ClinicSpecialistTreatment[] => {
  const byTreatmentId = new Map<string, ClinicSpecialistTreatment>();

  for (const item of items) {
    const existing = byTreatmentId.get(item.treatmentId);

    if (!existing) {
      byTreatmentId.set(item.treatmentId, item);
      continue;
    }

    const existingPrice = existing.minPrice ?? Infinity;
    const nextPrice = item.minPrice ?? Infinity;

    if (nextPrice < existingPrice) {
      byTreatmentId.set(item.treatmentId, item);
    }
  }

  return Array.from(byTreatmentId.values());
};

export const mapClinicSpecialistTreatmentToTreatment = (
  item: ClinicSpecialistTreatment,
): Treatment =>
  ({
    id: item.treatmentId,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    name: item.treatmentName,
    image: item.treatmentImage ?? "",
    overview: item.treatmentOverview ?? "",
    published: true,
    authorId: "",
    authorName: "",
    authorEmail: "",
    minPrice: item.minPrice,
    maxPrice: item.maxPrice,
    avgPrice: item.avgPrice,
    searchClicks: item.searchClicks,
    clinicCount: 1,
    specialistCount: 1,
    entityType: "ENTITY_TYPE#TREATMENT",
  }) as Treatment;
