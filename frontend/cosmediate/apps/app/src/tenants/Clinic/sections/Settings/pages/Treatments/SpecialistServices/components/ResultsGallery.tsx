import TreatmentResultCard from "@app/components/treatments/TreatmentResultCard";
import { NoDataFound } from "@cosmediate/ui";
import { TreatmentResult } from "@cosmediate/type-utils";

interface ResultsGalleryProps {
  results: TreatmentResult[];
}

export const ResultsGallery = ({ results }: ResultsGalleryProps) => {
  if (results.length === 0) {
    return <NoDataFound message="No results" description="" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {results.map((result) => (
        <TreatmentResultCard key={result.id} result={result} readOnly />
      ))}
    </div>
  );
};
