import { DateTime } from "luxon";
import React from "react";

import { Clinic } from "@cosmediate/type-utils";

import { Calendar, Clock, FileText } from "lucide-react";
import { TbCategory } from "react-icons/tb";
import { Separator } from "@cosmediate/ui/index";

export const InfoSection = ({ clinic }: { clinic: Clinic }) => {
  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    const dateStr = typeof date === "string" ? date : date.toISOString();
    return DateTime.fromISO(dateStr).toFormat("dd MMM yyyy, HH:mm");
  };

  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <FileText className="h-4 w-4" />
        Clinic Information
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-3">
        {clinic?.categories?.length > 0 && (
          <div className="w-full flex flex-col items-start justify-start gap-3 p-3 bg-primary-accent/5 rounded-lg">
            <div className="w-full flex items-center justify-start gap-3">
              <TbCategory />
              <div>Categories</div>
            </div>

            {clinic?.categories?.map((cat) => (
              <div
                key={cat.id}
                className="w-full flex flex-col items-start justify-start gap-3 px-2"
              >
                <div className="text-sm text-700 capitalize">{cat?.name}</div>
                <Separator className="w-full last:bg-transparent" />
              </div>
            ))}
          </div>
        )}

        <div className="w-full flex items-center gap-3 p-3 bg-primary-accent/5 rounded-lg">
          <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm text-800">{formatDate(clinic.createdAt)}</p>
          </div>
        </div>

        <div className="w-full flex items-center gap-3 p-3 bg-primary-accent/5 rounded-lg">
          <Clock className="h-4 w-4 text-gray-600 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="text-sm text-800">{formatDate(clinic.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
