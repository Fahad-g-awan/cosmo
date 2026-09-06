import { SubTreatmentType } from "../types/treatment.types";
import { TreatmentAssignmentType } from "../types/treatment.types";

export const newSubTreatment: SubTreatmentType = {
  name: "",
  price: 0,
  duration: "",
  available: false,
  brandIds: [],
};

export const newTreatmentAssignment: TreatmentAssignmentType = {
  specialistId: "",
  specialistExperience: "",
};

/** Name, price (> 0), duration, and at least one brand. */
export const isValidSubTreatment = (row?: SubTreatmentType | null) => {
  if (!row) return false;

  return (
    Boolean(row.name?.trim()) &&
    Number(row.price) > 0 &&
    Boolean(row.duration?.trim()) &&
    Array.isArray(row.brandIds) &&
    row.brandIds.length > 0
  );
};

/** Placeholder / cleared row (available is ignored). */
export const isEmptySubTreatmentRow = (row?: SubTreatmentType | null) => {
  if (!row) return true;

  return (
    !row.name?.trim() &&
    !(Number(row.price) > 0) &&
    !row.duration?.trim() &&
    !(row.brandIds?.length > 0)
  );
};

/** Partially filled row — blocks save. */
export const isIncompleteSubTreatmentRow = (row?: SubTreatmentType | null) =>
  !isEmptySubTreatmentRow(row) && !isValidSubTreatment(row);

const normalizeSubTreatmentRows = (rows: SubTreatmentType[] = []) =>
  rows
    .filter(isValidSubTreatment)
    .map((row) => ({
      id: row.id ?? "",
      name: row.name.trim(),
      price: Number(row.price),
      duration: row.duration.trim(),
      available: Boolean(row.available),
      brandIds: [...(row.brandIds ?? [])].sort(),
    }))
    .sort((a, b) =>
      (a.id || a.name).localeCompare(b.id || b.name, undefined, {
        sensitivity: "base",
      }),
    );

export const areSubTreatmentRowsEqual = (
  current: SubTreatmentType[] = [],
  baseline: SubTreatmentType[] = [],
) =>
  JSON.stringify(normalizeSubTreatmentRows(current)) ===
  JSON.stringify(normalizeSubTreatmentRows(baseline));

/**
 * Save allowed when there are no incomplete rows and payload differs from
 * baseline (including clearing all sub-treatments to []).
 */
export const canSaveSubTreatments = (
  current: SubTreatmentType[] = [],
  baseline: SubTreatmentType[] = [],
) => {
  if (current.some(isIncompleteSubTreatmentRow)) return false;
  return !areSubTreatmentRowsEqual(current, baseline);
};

/** Both specialist and experience are filled. */
export const isValidTreatmentAssignment = (row: {
  specialistId?: string;
  specialistExperience?: string;
}) =>
  Boolean(row.specialistId?.trim()) &&
  Boolean(row.specialistExperience?.trim());

/** Neither field has content (placeholder / cleared row). */
export const isEmptyAssignmentRow = (row: {
  specialistId?: string;
  specialistExperience?: string;
}) =>
  !row.specialistId?.trim() && !row.specialistExperience?.trim();

/** One field filled without the other. */
export const isIncompleteAssignmentRow = (row: {
  specialistId?: string;
  specialistExperience?: string;
}) => !isEmptyAssignmentRow(row) && !isValidTreatmentAssignment(row);

/** Normalize filled rows for dirty comparison (order-independent). */
export const normalizeAssignmentRows = (
  rows: TreatmentAssignmentType[] = [],
): TreatmentAssignmentType[] =>
  rows
    .filter(isValidTreatmentAssignment)
    .map((row) => ({
      specialistId: row.specialistId.trim(),
      specialistExperience: row.specialistExperience.trim(),
    }))
    .sort((a, b) => a.specialistId.localeCompare(b.specialistId));

export const areAssignmentRowsEqual = (
  current: TreatmentAssignmentType[] = [],
  baseline: TreatmentAssignmentType[] = [],
) =>
  JSON.stringify(normalizeAssignmentRows(current)) ===
  JSON.stringify(normalizeAssignmentRows(baseline));

/**
 * Save is allowed when there are no incomplete rows and the payload
 * differs from baseline (including clearing all assignments to []).
 * Pure empty/placeholder state with no baseline data keeps Save disabled.
 */
export const canSaveAssignments = (
  current: TreatmentAssignmentType[] = [],
  baseline: TreatmentAssignmentType[] = [],
) => {
  if (current.some(isIncompleteAssignmentRow)) return false;
  return !areAssignmentRowsEqual(current, baseline);
};
