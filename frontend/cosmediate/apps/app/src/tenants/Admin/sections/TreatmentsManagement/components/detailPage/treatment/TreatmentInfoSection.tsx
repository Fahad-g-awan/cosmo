import { DateTime } from "luxon";
import React from "react";

import { Treatment } from "@cosmediate/type-utils";
import { Badge } from "@cosmediate/ui";

import { Calendar, Clock, FileText } from "lucide-react";

export const TreatmentInfoSection = ({
  treatment,
}: {
  treatment: Treatment;
}) => {
  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    const dateStr = typeof date === "string" ? date : date.toISOString();
    return DateTime.fromISO(dateStr).toFormat("dd MMM yyyy, HH:mm");
  };

  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <FileText className="h-4 w-4" />
        Treatment Information
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-4">
        <div className="w-full flex flex-col items-center justify-start gap-3">
          <div className="w-full flex flex-col items-start justify-center gap-2">
            <span className="text-sm text-muted-foreground">Category</span>
            <Badge variant="secondary" className="capitalize">
              {treatment.categoryName}
            </Badge>
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-start gap-3">
          <div className="w-full flex flex-col items-start justify-center gap-2">
            <span className="text-sm text-muted-foreground">Recovery Time</span>
            <Badge variant="secondary" className="capitalize">
              {treatment.recoveryTime}
            </Badge>
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-start gap-3">
          <div className="w-full flex flex-col items-start justify-center gap-2">
            <span className="text-sm text-muted-foreground">
              Anesthesia Requirement
            </span>
            <Badge variant="secondary" className="capitalize">
              {treatment.anesthesia}
            </Badge>
          </div>
        </div>

        <div className="w-full flex flex-col items-start justify-start gap-3">
          <div className="w-full flex items-center gap-3 p-3 bg-primary-accent/5 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm text-800">
                {formatDate(treatment.createdAt)}
              </p>
            </div>
          </div>

          <div className="w-full flex items-center gap-3 p-3 bg-primary-accent/5 rounded-lg">
            <Clock className="h-4 w-4 text-gray-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm text-800">
                {formatDate(treatment.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
