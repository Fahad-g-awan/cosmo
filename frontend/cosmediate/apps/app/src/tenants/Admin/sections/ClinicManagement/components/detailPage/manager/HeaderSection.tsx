import Image from "next/image";
import React from "react";

import { ClinicManager } from "@cosmediate/type-utils/auth";
import { CrudProfileActions } from "@app/components/profile/CrudProfileActions";

import { FiUser as UserIcon } from "react-icons/fi";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-600",
  BLOCKED: "bg-red-100 text-red-600",
  PENDING: "bg-yellow-100 text-yellow-600",
};

export const HeaderSection = ({
  manager,
  handleDelete,
  perms = [],
}: {
  manager: ClinicManager;
  handleDelete: () => void;
  perms?: string[];
}) => {
  return (
    <div className="w-full lg:sticky lg:top-0 grid grid-cols-[130px_repeat(2,1fr)] max-sm:grid-cols-1 items-center max-sm:justify-center gap-10 bg-gradient-lite-violet px-6 py-8">
      <div className="w-30 h-30 rounded-full border-4 border-primary-accent overflow-hidden bg-white place-self-center">
        <Image
          src={manager.image || "/avatar.jpg"}
          alt={manager.fullName}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="self-start text-center md:text-left text-800">
        <h1 className="text-2xl font-bold capitalize">{manager.fullName}</h1>
        <p className="text-600 flex items-center justify-center md:justify-start gap-2 mt-1">
          <UserIcon className="w-4 h-4" />
          manager
        </p>
        <span
          className={`inline-block mt-2 px-4 py-2 rounded-full text-xs font-medium ${statusColors[manager.status] || "bg-100 text-800"}`}
        >
          {manager.status}
        </span>
      </div>

      <CrudProfileActions
        perms={perms}
        resource="clinic_manager"
        editHref={`/clinic-management/managers/update/${manager.id}`}
        onDelete={handleDelete}
        className="flex self-start items-start justify-end max-sm:justify-center max-sm:w-full gap-3"
      />
    </div>
  );
};
