import React from "react";

import { Lead, LeadStatus } from "@cosmediate/type-utils";

import { CrudProfileActions } from "@app/components/profile/CrudProfileActions";

import StatusUpdateSection from "./StatusUpdateSection";
import { Mail } from "lucide-react";

export const HeaderSection = ({
  handleStatusChange,
  handleDelete,
  lead,
  isUpdating,
  perms = [],
}: {
  handleStatusChange: (status: LeadStatus) => Promise<void>;
  handleDelete?: () => void;
  lead: Lead;
  isUpdating: boolean;
  perms?: string[];
}) => {
  return (
    <div className="w-full lgsticky lg:top-0 grid grid-cols-2 max-sm:grid-cols-1 items-center gap-10 bg-gradient-lite-violet px-6 py-8">
      <div className="w-full self-start text-center md:text-left text-800">
        <h1 className="text-2xl font-bold capitalize">{lead.fullName}</h1>
        <p className="text-400 flex items-center gap-2 mt-1">
          <Mail className="w-4 h-4" />
          {lead.email}
        </p>
      </div>

      <div className="flex sm:self-start items-start justify-end max-sm:justify-center gap-3">
        <StatusUpdateSection
          leadStatus={lead?.status as string}
          isUpdating={isUpdating}
          handleStatusChange={handleStatusChange}
        />
        {handleDelete && (
          <CrudProfileActions
            perms={perms}
            resource="lead"
            onDelete={handleDelete}
            className="flex items-start justify-end gap-3"
          />
        )}
      </div>
    </div>
  );
};
