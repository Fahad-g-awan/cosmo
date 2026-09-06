import { TreatmentCardLoader, SiteContainer } from "@cosmediate/ui";

export const TreatmentsLoader = () => {
  return (
    <SiteContainer>
      <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-center justify-center gap-10">
        <TreatmentCardLoader />
        <TreatmentCardLoader />
        <TreatmentCardLoader />
        <TreatmentCardLoader />
        <TreatmentCardLoader />
        <TreatmentCardLoader />
      </div>
    </SiteContainer>
  );
};
