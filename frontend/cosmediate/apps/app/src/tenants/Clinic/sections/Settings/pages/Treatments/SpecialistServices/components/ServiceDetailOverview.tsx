import Image from "next/image";

import type { ClinicSpecialistTreatmentItem } from "@cosmediate/api";
import { NoDataFound } from "@cosmediate/ui";

interface ServiceDetailOverviewProps {
  assignment: ClinicSpecialistTreatmentItem | null;
}

export function ServiceDetailOverview({ assignment }: ServiceDetailOverviewProps) {
  if (!assignment) {
    return (
      <NoDataFound
        message="Service not found"
        description="This treatment may no longer be assigned to you."
      />
    );
  }

  return (
    <div className="w-full flex flex-col sm:flex-row gap-4 p-4 border border-stroke rounded-xl bg-ghost-blue/40">
      <div className="relative h-[160px] w-full sm:w-[220px] shrink-0 rounded-lg overflow-hidden bg-white">
        <Image
          src={assignment.treatmentImage || "/placeholder.jpg"}
          alt={assignment.treatmentName}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <h1 className="text-xl font-semibold text-700 capitalize">
          {assignment.treatmentName}
        </h1>

        {assignment.categoryName ? (
          <p className="text-sm text-400 capitalize">{assignment.categoryName}</p>
        ) : null}

        {assignment.treatmentOverview ? (
          <p className="text-sm text-500">{assignment.treatmentOverview}</p>
        ) : null}

        {assignment.specialistExperience ? (
          <p className="text-sm text-400">
            Your experience: {assignment.specialistExperience}
          </p>
        ) : null}
      </div>
    </div>
  );
}
