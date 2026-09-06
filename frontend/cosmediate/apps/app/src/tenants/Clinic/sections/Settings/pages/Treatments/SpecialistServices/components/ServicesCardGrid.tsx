import type { ClinicSpecialistTreatmentItem } from "@cosmediate/api";
import { NoDataFound } from "@cosmediate/ui";

import { ServiceCard } from "./ServiceCard";

import { LuBriefcaseMedical } from "react-icons/lu";

interface ServicesCardGridProps {
  items: ClinicSpecialistTreatmentItem[];
  getServiceHref: (clinicTreatmentId: string) => string;
}

export const ServicesCardGrid = ({
  items,
  getServiceHref,
}: ServicesCardGridProps) => {
  if (items.length === 0) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center border border-stroke rounded-xl bg-ghost-blue/90">
        <NoDataFound
          message="No services in this category"
          description="Try another category or check back later."
          icon={<LuBriefcaseMedical className="size-6 text-500" />}
        />
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ServiceCard
          key={item.id}
          item={item}
          href={getServiceHref(item.clinicTreatmentId)}
        />
      ))}
    </div>
  );
};
