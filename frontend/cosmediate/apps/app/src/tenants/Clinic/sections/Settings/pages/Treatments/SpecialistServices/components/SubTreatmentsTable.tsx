import { NoDataFound } from "@cosmediate/ui";
import { SubTreatment } from "@cosmediate/type-utils";

interface SubTreatmentsTableProps {
  subTreatments: SubTreatment[];
}

export const SubTreatmentsTable = ({
  subTreatments,
}: SubTreatmentsTableProps) => {
  if (subTreatments.length === 0) {
    return <NoDataFound message="No sub-treatments" description="" />;
  }

  return (
    <div className="w-full border border-stroke rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 px-3 py-2 text-xs font-medium text-400 border-b border-stroke">
        <div>Name</div>
        <div>Price</div>
        <div>Duration</div>
      </div>
      {subTreatments.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-3 px-3 py-2 text-sm border-b border-stroke/50 last:border-0"
        >
          <div>{row.name}</div>
          <div>{row.price}</div>
          <div>{row.duration}</div>
        </div>
      ))}
    </div>
  );
};
