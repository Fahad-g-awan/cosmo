import Image from "next/image";
import Link from "next/link";
import React from "react";

import type { Patient } from "@cosmediate/type-utils/auth";
import { Button } from "@cosmediate/ui";

import { FiEdit as Edit, FiUser as UserIcon } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-600",
  BLOCKED: "bg-red-100 text-red-600",
  PENDING: "bg-yellow-100 text-yellow-600",
};

import { canCrud } from "@app/lib/permissions";

export const HeaderSection = ({
  patient,
  handleDelete,
  perms = [],
}: {
  patient: Patient;
  handleDelete: () => void;
  perms?: string[];
}) => {
  const canEdit = canCrud(perms, "patient", "update");
  const canDelete = canCrud(perms, "patient", "delete");

  return (
    <div className="w-full lgsticky lg:top-0 grid grid-cols-[130px_repeat(2,1fr)] max-sm:grid-cols-1 items-center gap-10 bg-gradient-lite-violet px-6 py-8">
      <div className="w-30 h-30 rounded-full border-4 border-primary-accent overflow-hidden bg-white place-self-center">
        <Image
          src={patient.image || "/avatar.jpg"}
          alt={patient.fullName}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="self-start text-center md:text-left text-800">
        <h1 className="text-2xl font-bold capitalize">{patient.fullName}</h1>
        <p className="text-600 flex items-center justify-center md:justify-start gap-2 mt-1">
          <UserIcon className="w-4 h-4" />
          Patient
        </p>
        <span
          className={`inline-block mt-2 px-4 py-2 rounded-full text-xs font-medium ${statusColors[patient.status] || "bg-100 text-800"}`}
        >
          {patient.status}
        </span>
      </div>

      {(canEdit || canDelete) && (
        <div className="flex self-start items-start justify-end max-sm:justify-center gap-3">
          {canEdit && (
            <Button
              variant="outline"
              asChild
              className="bg-white flex items-center justify-center gap-2"
            >
              <Link href={`/patients/update/${patient.id}`}>
                <Edit className="w-4 h-4" />
                <span className="max-lg:hidden">Edit</span>
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              className="bg-white text-danger hover:bg-red-50 hover:text-danger flex items-center justify-center gap-2"
              onClick={handleDelete}
            >
              <RiDeleteBin6Line className="w-4 h-4" />
              <span className="max-lg:hidden">Delete</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
