import React from "react";

import { Clinic } from "@cosmediate/type-utils";

import { Calendar } from "lucide-react";

export const SystemInfoSection = ({ clinic }: { clinic: Clinic }) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <Calendar className="h-5 w-5" />
        System Information
      </div>

      <div className="w-full flex flex-col items-center justify-start">
        <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-4">
          <div className="w-full flex flex-col items-start justify-start gap-2 p-3 bg-primary-accent/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">clinic ID</p>
            <p className="text-sm font-medium font-mono break-all">
              {clinic.id}
            </p>
          </div>

          <div className="w-full flex flex-col items-start justify-start gap-2 p-3 bg-primary-accent/5 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Tags Count</p>
            <p className="text-sm font-medium">{clinic.tags?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
