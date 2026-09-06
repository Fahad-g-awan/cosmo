import { TreatmentResult } from "@cosmediate/type-utils";

import TreatmentResultCard from "@app/components/treatments/TreatmentResultCard";

import { ClinicTreatmentOffering } from "../../../../types/treatment.types";
import { ResultsAccordionHeader } from "./ResultsAccordionHeader";

interface ResultsOfferingAccordionProps {
  offering: ClinicTreatmentOffering;
  results: TreatmentResult[];
  isMinimized: boolean;
  perms: string[];
  onToggleMinimize: (clinicTreatmentId: string) => void;
  onEdit: (resultId: string) => void;
  onDelete: (resultId: string) => void;
}

export const ResultsOfferingAccordion = ({
  offering,
  results,
  isMinimized,
  perms,
  onToggleMinimize,
  onEdit,
  onDelete,
}: ResultsOfferingAccordionProps) => {
  const clinicTreatmentId = offering.id;

  return (
    <div className="w-full flex flex-col items-center justify-start gap-2.5 p-2 py-4 bg-ghost-blue rounded-xl">
      <ResultsAccordionHeader
        treatmentName={offering.treatmentName}
        clinicTreatmentId={clinicTreatmentId}
        isMinimized={isMinimized}
        onToggleMinimize={onToggleMinimize}
      />

      {!isMinimized && (
        <div className="w-full flex flex-col gap-3">
          {results.length > 0 ? (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((result) => (
                <TreatmentResultCard
                  key={result.id}
                  result={result}
                  handleDelete={onDelete}
                  handleEdit={onEdit}
                  perms={perms}
                />
              ))}
            </div>
          ) : (
            <div className="w-full p-4 text-center text-sm text-400 border border-dashed border-stroke rounded-xl bg-white">
              No before/after results for this treatment yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
