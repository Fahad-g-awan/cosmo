"use client";

import Link from "next/link";

import { Button } from "@cosmediate/ui";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Eye } from "lucide-react";

import { canCrud } from "@app/lib/permissions";

interface CrudActionButtonsProps {
  perms: string[];
  resource: string;
  viewHref?: string;
  editHref?: string;
  onDelete?: () => void;
}

export const CrudActionButtons = ({
  perms,
  resource,
  viewHref,
  editHref,
  onDelete,
}: CrudActionButtonsProps) => {
  const canView = viewHref ? canCrud(perms, resource, "read") : false;
  const canEdit = editHref ? canCrud(perms, resource, "update") : false;
  const canDelete = onDelete ? canCrud(perms, resource, "delete") : false;

  if (!canView && !canEdit && !canDelete) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      {canView && viewHref && (
        <Button variant="outline" className="p-0">
          <Link
            href={viewHref}
            className="text-primary-accent hover:text-primary-accent max-lg:bg-ghost-blue px-3 py-2.5 rounded-lg"
          >
            <Eye />
          </Link>
        </Button>
      )}

      {canEdit && editHref && (
        <Button variant="outline" className="p-0">
          <Link
            href={editHref}
            className="text-primary-accent hover:text-primary-accent max-lg:bg-ghost-blue px-3 py-2.5 rounded-lg"
          >
            <FiEdit />
          </Link>
        </Button>
      )}

      {canDelete && onDelete && (
        <Button
          variant="outline"
          className="text-danger hover:bg-danger/10 px-3 py-2.5 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <RiDeleteBin6Line />
        </Button>
      )}
    </div>
  );
};
