import React from "react";

import { Clinic } from "@cosmediate/type-utils";

import { Globe, LucideBriefcaseMedical, UserRoundPlus } from "lucide-react";
import { IoStatsChartOutline } from "react-icons/io5";
import { GrUserAdmin } from "react-icons/gr";

export const StatsSection = ({ clinic }: { clinic: Clinic }) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <IoStatsChartOutline className="h-5 w-5" />
        Clinic Stats
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center">
          <GrUserAdmin className="w-6 h-6 text-primary-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{clinic.managerCount || 0}</p>
          <p className="text-sm text-gray-500">Managers</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <UserRoundPlus className="w-6 h-6 text-primary-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{clinic.specialistCount || 0}</p>
          <p className="text-sm text-gray-500">Specialists</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <LucideBriefcaseMedical className="w-6 h-6 text-primary-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{clinic.treatmentCount || 0}</p>
          <p className="text-sm text-gray-500">Treatments</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <Globe className="w-6 h-6 text-primary-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{clinic.searchClicks ?? 0}</p>
          <p className="text-sm text-gray-500">Searches</p>
        </div>
      </div>
    </div>
  );
};
