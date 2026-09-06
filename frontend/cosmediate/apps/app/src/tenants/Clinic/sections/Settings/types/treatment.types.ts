import {
  ClinicTreatment,
  ClinicSpecialistTreatment,
  SubTreatment,
  TreatmentCategory,
} from "@cosmediate/type-utils";

/** Sidebar tab identity — full catalog categories satisfy this type. */
export type TreatmentCategoryTab = Pick<TreatmentCategory, "id" | "name">;

export type SubTreatmentType = Omit<
  SubTreatment,
  | "id"
  | "entityType"
  | "createdAt"
  | "updatedAt"
  | "brands"
> & {
  id?: string;
  clinicTreatmentId?: string;
  brandIds: string[];
  brands?: string[];
};

export type ClinicTreatmentOffering = ClinicTreatment;

export type TreatmentAssignmentType = {
  specialistId: string;
  specialistExperience: string;
};

export type ProfileTreatmentCard = {
  id: string;
  clinicTreatmentId: string;
  treatmentId: string;
  name: string;
  image?: string | null;
  categoryId: string;
  categoryName: string;
};

export const mapAssignmentToProfileCard = (
  item: ClinicSpecialistTreatment,
): ProfileTreatmentCard => ({
  id: item.clinicTreatmentId,
  clinicTreatmentId: item.clinicTreatmentId,
  treatmentId: item.treatmentId,
  name: item.treatmentName,
  image: item.treatmentImage,
  categoryId: item.categoryId,
  categoryName: item.categoryName,
});

export const dedupeProfileTreatments = (
  items: ProfileTreatmentCard[],
): ProfileTreatmentCard[] => {
  const seen = new Map<string, ProfileTreatmentCard>();
  items.forEach((item) => {
    if (!seen.has(item.clinicTreatmentId)) {
      seen.set(item.clinicTreatmentId, item);
    }
  });
  return [...seen.values()];
};
