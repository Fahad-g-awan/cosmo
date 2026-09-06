import { Treatment, TreatmentResult } from "@cosmediate/type-utils";

import TreatmentResultCard from "@app/components/treatments/TreatmentResultCard";

import { AdminResultsAccordionHeader } from "./AdminResultsAccordionHeader";

interface AdminResultsTreatmentAccordionProps {
  treatment: Treatment;
  results: TreatmentResult[];
  isMinimized: boolean;
  perms: string[];
  onToggleMinimize: (treatmentId: string) => void;
  onEdit: (resultId: string) => void;
  onDelete: (resultId: string) => void;
}

export const AdminResultsTreatmentAccordion = ({
  treatment,
  results,
  isMinimized,
  perms,
  onToggleMinimize,
  onEdit,
  onDelete,
}: AdminResultsTreatmentAccordionProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-2.5 p-2 py-4 bg-ghost-blue rounded-xl">
      <AdminResultsAccordionHeader
        treatmentName={treatment.name}
        treatmentId={treatment.id}
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
