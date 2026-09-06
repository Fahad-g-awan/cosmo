import React from "react";

import { LeadStatus } from "@cosmediate/type-utils";
import { ComboboxSelect } from "@cosmediate/ui";

import { cn } from "@cosmediate/ui/lib/utils";

const statusOptions: { value: LeadStatus; label: string; color: string }[] = [
  { value: "NEW", label: "New", color: "bg-blue-100 text-blue-800" },
  {
    value: "PENDING_REVIEW",
    label: "Pending Review",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "CONTACTED",
    label: "Contacted",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "QUALIFIED",
    label: "Qualified",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    value: "CONVERTED",
    label: "Converted",
    color: "bg-green-100 text-green-800",
  },
  { value: "ARCHIVED", label: "Archived", color: "bg-gray-100 text-gray-800" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800" },
];

const StatusUpdateSection = ({
  handleStatusChange,
  leadStatus,
  isUpdating,
}: {
  handleStatusChange: (status: LeadStatus) => Promise<void>;
  leadStatus: string;
  isUpdating: boolean;
}) => {
  const currentStatus = statusOptions.find((s) => s.value === leadStatus);

  return (
    <div className="flex items-center gap-3">
      <ComboboxSelect
        buttonClassName="min-w-[180px]"
        placeholder={isUpdating ? "Updating..." : "Select Status"}
        searchPlaceholder={"Search status..."}
        value={currentStatus?.value}
        onValueChange={(value: string) =>
          handleStatusChange(value as LeadStatus)
        }
        disabled={isUpdating}
        options={statusOptions.map((status) => ({
          value: status.label,
          label: (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                status.color
              )}
            >
              {status.label}
            </span>
          ),
        }))}
      />
    </div>
  );
};

export default StatusUpdateSection;
