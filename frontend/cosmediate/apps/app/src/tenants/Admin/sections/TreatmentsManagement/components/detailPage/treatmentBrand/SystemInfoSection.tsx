import { DateTime } from "luxon";
import React from "react";

import { TreatmentBrand } from "@cosmediate/type-utils";

import { Calendar, Clock } from "lucide-react";

export const SystemInfoSection = ({ brand }: { brand: TreatmentBrand }) => {
  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    const dateStr = typeof date === "string" ? date : date.toISOString();
    return DateTime.fromISO(dateStr).toFormat("dd MMM yyyy, HH:mm");
  };

  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <Calendar className="h-5 w-5" />
        System Information
      </div>

      <div className="w-full grid grid-cols-3 max-sm:grid-cols-1 items-start justify-center gap-6">
        <div className="w-full flex flex-col items-start justify-start gap-2 p-3 bg-primary-accent/5 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">brand ID</p>
          <p className="text-sm font-medium font-mono break-all">{brand.id}</p>
        </div>

        <div className="w-full flex flex-col items-start justify-start gap-2 p-3 bg-primary-accent/5 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Created</p>
          </div>
          <p className="text-sm font-medium">{formatDate(brand.createdAt)}</p>
        </div>

        <div className="w-full flex flex-col items-start justify-start gap-2 p-3 bg-primary-accent/5 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Last Updated</p>
          </div>
          <p className="text-sm font-medium">{formatDate(brand.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
};
