import React from "react";

import { Specialist } from "@cosmediate/type-utils";

import { IoStatsChartOutline } from "react-icons/io5";
import { LuBriefcaseMedical } from "react-icons/lu";
import { BiClinic } from "react-icons/bi";
import { Globe } from "lucide-react";

export const StatsSection = ({ specialist }: { specialist: Specialist }) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <IoStatsChartOutline className="h-5 w-5" />
        Specialist Stats
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center">
          <BiClinic className="w-6 h-6 text-primary-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">
            {specialist.clinics?.length || 0}
          </p>
          <p className="text-sm text-gray-500">Associated Clinics</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <LuBriefcaseMedical className="w-6 h-6 text-primary-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{specialist.treatmentCount || 0}</p>
          <p className="text-sm text-gray-500">Treatments</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <Globe className="w-6 h-6 text-primary-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{specialist.searchClicks ?? 0}</p>
          <p className="text-sm text-gray-500">Searches</p>
        </div>
      </div>
    </div>
  );
};
