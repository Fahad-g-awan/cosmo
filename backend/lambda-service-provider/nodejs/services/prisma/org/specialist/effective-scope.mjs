const resolvePrimaryClinicLink = (links = []) => {
  return (
    links.find(
      (l) =>
        l.isPrimary &&
        l.associationType === "FULL_TIME" &&
        l.status === "ACTIVE",
    ) ??
    links.find(
      (l) => l.associationType === "FULL_TIME" && l.status === "ACTIVE",
    ) ??
    null
  );
};

const resolveClinicIds = (links = []) =>
  links.map((l) => l.clinicId).filter(Boolean);

const resolveParentClinicId = (links = []) =>
  resolvePrimaryClinicLink(links)?.clinicId ?? null;

/**
 * Specialist clinic scope from ACTIVE `ClinicSpecialistLink` rows.
 * Mirrors specialist DTO resolution, falls back to profile columns when unlinked.
 */
export const resolveSpecialistClinicScope = async (
  db,
  specialistId,
  profile = {},
) => {
  if (!specialistId) {
    return {
      clinicIds: [],
      parentClinicId: null,
      workingType: profile.workingType ?? null,
    };
  }

  const links = await db.clinicSpecialistLink.findMany({
    where: {
      specialistId,
      status: "ACTIVE",
      clinic: { deleted: false },
    },
    select: {
      clinicId: true,
      associationType: true,
      isPrimary: true,
      status: true,
    },
  });

  const resolvedClinicIds = resolveClinicIds(links);
  const clinicIds = resolvedClinicIds.length
    ? resolvedClinicIds
    : (profile.clinicIds ?? []);
  const parentClinicId =
    resolveParentClinicId(links) ?? profile.parentClinicId ?? null;

  return {
    clinicIds,
    parentClinicId,
    workingType: profile.workingType ?? null,
  };
};
