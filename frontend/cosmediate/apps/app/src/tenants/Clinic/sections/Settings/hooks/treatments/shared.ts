import { SubTreatment } from "@cosmediate/type-utils";

import {
  isEmptySubTreatmentRow,
  newSubTreatment,
} from "../../defaults/treatment.defaults";
import { SubTreatmentType } from "../../types/treatment.types";

export const mapApiSubTreatment = (
  st: SubTreatment & {
    clinicTreatmentId?: string;
    categoryId?: string;
    categoryName?: string;
  },
): SubTreatmentType => ({
  id: st.id,
  clinicTreatmentId: st.clinicTreatmentId,
  treatmentId: st.treatmentId,
  clinicId: st.clinicId,
  name: st.name,
  price: st.price,
  duration: st.duration,
  available: st.available,
  brandIds: st.brands?.map((b) => b.id) ?? [],
});

export const withSubTreatmentPlaceholder = (rows: SubTreatmentType[]) => {
  const list = [...rows];
  const last = list[list.length - 1];
  const hasPlaceholder = list.length > 0 && isEmptySubTreatmentRow(last);

  if (!hasPlaceholder) {
    list.push({ ...newSubTreatment });
  }

  return list;
};
