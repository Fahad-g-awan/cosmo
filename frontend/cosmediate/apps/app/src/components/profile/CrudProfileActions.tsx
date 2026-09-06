"use client";

import Link from "next/link";

import { Button } from "@cosmediate/ui";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";

import { canCrud } from "@app/lib/permissions";

interface CrudProfileActionsProps {
  perms?: string[];
  resource: string;
  editHref?: string;
  editLabel?: string;
  deleteLabel?: string;
  onDelete?: () => void;
  className?: string;
}

export const CrudProfileActions = ({
  perms = [],
  resource,
  editHref,
  editLabel = "Edit",
  deleteLabel = "Delete",
  onDelete,
  className = "flex self-start items-start justify-end max-sm:justify-center gap-3",
}: CrudProfileActionsProps) => {
  const canEdit = editHref ? canCrud(perms, resource, "update") : false;
  const canDelete = onDelete ? canCrud(perms, resource, "delete") : false;

  if (!canEdit && !canDelete) return null;

  return (
    <div className={className}>
      {canEdit && editHref && (
        <Button
          variant="outline"
          asChild
          className="bg-white flex items-center justify-center gap-2"
        >
          <Link href={editHref}>
            <FiEdit className="w-4 h-4" />
            <span className="max-lg:hidden">{editLabel}</span>
          </Link>
        </Button>
      )}

      {canDelete && onDelete && (
        <Button
          variant="outline"
          className="bg-white text-danger hover:bg-red-50 hover:text-danger flex items-center justify-center gap-2"
          onClick={onDelete}
        >
          <RiDeleteBin6Line className="w-4 h-4" />
          <span className="max-lg:hidden">{deleteLabel}</span>
        </Button>
      )}
    </div>
  );
};
